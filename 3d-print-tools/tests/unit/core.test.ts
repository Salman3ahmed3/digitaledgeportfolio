import { describe, expect, it } from "vitest";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { analyze, bounds, size, weld } from "@/lib/geometry/mesh";
import { toBinaryStl, toAsciiStl } from "@/lib/geometry/export/stl";
import { parseStl } from "@/lib/geometry/parse/stl";
import { exportParts } from "@/lib/geometry/export";
import { fromManifold, getManifold, toManifold } from "@/lib/geometry/manifold";
import { unzipSync, strFromU8 } from "fflate";

async function cube(sizeMm = 10) {
  const mf = await getManifold();
  const m = mf.Manifold.cube([sizeMm, sizeMm, sizeMm]);
  const mesh = fromManifold(m);
  m.delete();
  return mesh;
}

describe("mesh analysis", () => {
  it("cube is watertight with correct volume and area", async () => {
    const s = analyze(await cube(10));
    expect(s.watertight).toBe(true);
    expect(s.volume).toBeCloseTo(1000, 3);
    expect(s.area).toBeCloseTo(600, 3);
  });

  it("detects a missing triangle", async () => {
    const m = await cube(10);
    const broken = { positions: m.positions, indices: m.indices.slice(3) };
    const s = analyze(broken);
    expect(s.watertight).toBe(false);
    expect(s.openEdges).toBe(3);
  });

  it("round-trips through manifold", async () => {
    const mf = await getManifold();
    const m = toManifold(mf, await cube(5));
    expect(m.status()).toBe("NoError");
    expect(m.volume()).toBeCloseTo(125, 4);
    m.delete();
  });
});

describe("STL", () => {
  it("binary STL has a valid header and triangle count", async () => {
    const m = await cube();
    const bin = toBinaryStl([m]);
    const dv = new DataView(bin.buffer);
    expect(dv.getUint32(80, true)).toBe(12);
    expect(bin.byteLength).toBe(84 + 12 * 50);
  });

  it("round-trips through three's STLLoader with the same triangle count", async () => {
    const m = await cube();
    const bin = toBinaryStl([m]);
    const geo = new STLLoader().parse(bin.buffer as ArrayBuffer);
    expect(geo.getAttribute("position").count / 3).toBe(12);
  });

  it("our parser reads binary and ASCII STL and re-welds to a watertight solid", async () => {
    const m = await cube(20);
    for (const data of [toBinaryStl([m]).buffer as ArrayBuffer, new TextEncoder().encode(toAsciiStl([m])).buffer as ArrayBuffer]) {
      const soup = parseStl(data);
      expect(soup.length).toBe(12 * 9);
      const welded = weld(soup);
      expect(welded.positions.length / 3).toBe(8);
      expect(analyze(welded, true).watertight).toBe(true);
      expect(size(bounds(welded))).toEqual([20, 20, 20]);
    }
  });
});

describe("other exporters", () => {
  it("3MF contains a millimetre model with all triangles", async () => {
    const zip = unzipSync(exportParts([{ name: "cube", mesh: await cube(), color: "#ff0000" }], "3mf"));
    const xml = strFromU8(zip["3D/3dmodel.model"]);
    expect(xml).toContain('unit="millimeter"');
    expect(xml.match(/<triangle /g)?.length).toBe(12);
    expect(zip["[Content_Types].xml"]).toBeDefined();
  });

  it("GLB has a valid header and length", async () => {
    const glb = exportParts([{ name: "cube", mesh: await cube() }], "glb");
    const dv = new DataView(glb.buffer);
    expect(dv.getUint32(0, true)).toBe(0x46546c67);
    expect(dv.getUint32(8, true)).toBe(glb.byteLength);
  });

  it("OBJ and PLY include all faces", async () => {
    const m = await cube();
    const obj = new TextDecoder().decode(exportParts([{ name: "c", mesh: m }], "obj"));
    expect(obj.match(/^f /gm)?.length).toBe(12);
    const ply = new TextDecoder().decode(exportParts([{ name: "c", mesh: m }], "ply").slice(0, 300));
    expect(ply).toContain("element face 12");
  });
});
