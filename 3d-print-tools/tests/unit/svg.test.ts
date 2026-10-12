// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getManifold } from "@/lib/geometry/manifold";
import { parseSvg, detectBackground } from "@/lib/engines/svg/parse";
import { buildVector, unionParts } from "@/lib/engines/svg/build";
import { SVG_DEFAULTS, type SvgSettings } from "@/lib/engines/svg/settings";
import { analyze, mergeMeshes } from "@/lib/geometry/mesh";
import { loadFont, textToVector } from "@/lib/engines/text";

const fx = (n: string) => readFileSync(join(__dirname, "../fixtures", n), "utf8");
const svg = (body: string, vb = "0 0 100 100") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;

async function build(text: string, s: Partial<SvgSettings> = {}, hidden: string[] = []) {
  const mf = await getManifold();
  return buildVector(mf, { input: parseSvg(text, "high"), settings: { ...SVG_DEFAULTS, ...s }, hiddenColors: hidden });
}

describe("SVG extrude", () => {
  it("letter O keeps its hole (genus 1) and has the right volume", async () => {
    const r = await build(svg(`<path fill-rule="evenodd" d="M0 20 A20 20 0 1 0 40 20 A20 20 0 1 0 0 20 Z M10 20 A10 10 0 1 0 30 20 A10 10 0 1 0 10 20 Z"/>`), { width: 40, height: 3 });
    expect(r.watertight).toBe(true);
    const expected = Math.PI * (20 * 20 - 10 * 10) * 3;
    expect(r.volume).toBeGreaterThan(expected * 0.98);
    expect(r.volume).toBeLessThan(expected * 1.01);
    const mf = await getManifold();
    const m = new mf.Manifold(new mf.Mesh({ numProp: 3, vertProperties: r.parts[0].positions, triVerts: r.parts[0].indices }));
    expect(m.genus()).toBe(1);
    m.delete();
  });

  it("letter A (nonzero rule, inner triangle reversed) has a hole", async () => {
    const r = await build(fx("letters.svg"), { width: 80 });
    expect(r.watertight).toBe(true);
    const mf = await getManifold();
    const genus = r.parts.map((p) => {
      const m = new mf.Manifold(new mf.Mesh({ numProp: 3, vertProperties: p.positions, triVerts: p.indices }));
      const parts = m.decompose();
      const g = parts.map((x) => x.genus());
      parts.forEach((x) => x.delete());
      m.delete();
      return g;
    })[0];
    expect(genus.sort()).toEqual([1, 1]); // "O" and "A" both have one hole
  });

  it("scales to the real width within 0.01 mm and sits on Z=0", async () => {
    const r = await build(fx("multicolor.svg"), { width: 123.45, height: 4 });
    expect(Math.abs(r.size[0] - 123.45)).toBeLessThan(0.01);
    expect(r.size[2]).toBeCloseTo(4, 2);
  });

  it("removes the detected background layer", async () => {
    const input = parseSvg(fx("multicolor.svg"));
    expect(detectBackground(input)).toBe("#ffffff");
    const r = await build(fx("multicolor.svg"), {}, ["#ffffff"]);
    expect(r.parts.map((p) => p.color)).not.toContain("#ffffff");
    expect(r.parts.length).toBe(3);
  });

  it("stroke-only SVG gets volume from strokes / line width", async () => {
    const r = await build(fx("stroke-only.svg"), { width: 100, height: 2, lineWidth: 2 });
    expect(r.watertight).toBe(true);
    expect(r.volume).toBeGreaterThan(100);
    await expect(build(fx("stroke-only.svg"), { includeStrokes: false })).rejects.toThrow(/no closed shapes/);
  });

  it("base plate + bevel produce a single watertight union", async () => {
    const r = await build(fx("multicolor.svg"), { baseThickness: 2, bevel: 0.8 }, ["#ffffff"]);
    const mf = await getManifold();
    const u = unionParts(mf, r.parts);
    expect(analyze(u).watertight).toBe(true);
    expect(r.size[2]).toBeCloseTo(5, 2);
  });
});

describe("SVG modes", () => {
  for (const mode of ["stencil", "keychain", "cookie"] as const) {
    it(`${mode} output is watertight`, async () => {
      const r = await build(fx("multicolor.svg"), { mode, width: 60 }, ["#ffffff"]);
      expect(r.watertight).toBe(true);
      expect(analyze(mergeMeshes(r.parts)).volume).toBeGreaterThan(0);
    });
  }

  it("keychain variants are watertight", async () => {
    for (const plateShape of ["rounded", "circle", "hex", "outline"] as const)
      for (const loop of ["tab", "hole"] as const)
        for (const artStyle of ["raised", "flush", "engraved"] as const) {
          const r = await build(fx("letters.svg"), { mode: "keychain", plateShape, loop, artStyle });
          expect(r.watertight, `${plateShape}/${loop}/${artStyle}`).toBe(true);
        }
  });

  it("cookie cutter has the requested height and wall", async () => {
    const r = await build(fx("letters.svg"), { mode: "cookie", width: 70, cutterHeight: 14 });
    expect(r.size[2]).toBeCloseTo(14, 3);
    expect(r.size[0]).toBeCloseTo(70 + 2 * (1 + 4), 1); // width + wall + flange on both sides
  });

  it("stencil through-cut removes material", async () => {
    const solid = await build(fx("letters.svg"), { mode: "stencil", stencilCut: "recess", recessDepth: 0.5 });
    const through = await build(fx("letters.svg"), { mode: "stencil" });
    expect(through.volume).toBeLessThan(solid.volume);
  });
});

describe("text", () => {
  it("text becomes a watertight solid of the requested width", async () => {
    const font = await loadFont("inter", async (p) => {
      const b = readFileSync(join(__dirname, "../../public", p));
      return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    });
    const mf = await getManifold();
    const r = buildVector(mf, { input: textToVector(font, "Hi O\nA"), settings: { ...SVG_DEFAULTS, width: 50 } });
    expect(r.watertight).toBe(true);
    expect(Math.abs(r.size[0] - 50)).toBeLessThan(0.01);
  });
});
