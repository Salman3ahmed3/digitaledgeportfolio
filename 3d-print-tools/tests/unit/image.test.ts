import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";
import { getManifold } from "@/lib/geometry/manifold";
import { buildHeightmap, buildLogo } from "@/lib/engines/image/build";
import { IMAGE_DEFAULTS, type ImageSettings } from "@/lib/engines/image/settings";
import { analyze, mergeMeshes } from "@/lib/geometry/mesh";
import type { Rgba } from "@/lib/engines/image/pixels";

function random(w: number, h: number, seed = 1): Rgba {
  let x = seed;
  const rnd = () => ((x = (x * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const v = rnd() * 255;
    data.set([v, v, v, 255], i * 4);
  }
  return { data, width: w, height: h };
}

const png = (name: string): Rgba => {
  const img = PNG.sync.read(readFileSync(join(__dirname, "../fixtures", name)));
  return { data: img.data, width: img.width, height: img.height };
};

const S = (p: Partial<ImageSettings> = {}) => ({ ...IMAGE_DEFAULTS, ...p });

describe("heightmap", () => {
  for (const [w, h, seed] of [[37, 23, 1], [64, 64, 7], [5, 90, 3]] as const) {
    it(`random ${w}×${h} image gives a closed solid`, () => {
      const r = buildHeightmap(random(w, h, seed), S({ detail: "high", smoothing: 1 }));
      expect(r.watertight).toBe(true);
      expect(r.volume).toBeGreaterThan(0);
    });
  }

  it("matches requested width, aspect and heights within 0.01 mm", () => {
    const img = random(80, 40);
    const r = buildHeightmap(img, S({ width: 120, maxHeight: 4, minHeight: 0.5, baseThickness: 1.5, detail: "high" }));
    expect(Math.abs(r.size[0] - 120)).toBeLessThan(0.01);
    expect(Math.abs(r.size[1] - 60)).toBeLessThan(0.01);
    expect(r.size[2]).toBeLessThanOrEqual(5.5 + 0.01);
  });

  it("white is high, black is low (and invert flips it)", () => {
    const data = new Uint8ClampedArray(2 * 2 * 4);
    data.set([0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
    const img = { data, width: 2, height: 2 };
    const r = buildHeightmap(img, S({ detail: "high", baseThickness: 1, minHeight: 0, maxHeight: 4 }));
    const p = r.parts[0].positions;
    // vertex 0 = black pixel, vertex 1 = white pixel
    expect(p[2]).toBeCloseTo(1, 4);
    expect(p[5]).toBeCloseTo(5, 4);
    const inv = buildHeightmap(img, S({ detail: "high", invert: true, baseThickness: 1, maxHeight: 4 })).parts[0].positions;
    expect(inv[2]).toBeCloseTo(5, 4);
  });

  it("no base and zero min height still produces a solid", () => {
    const r = buildHeightmap(random(20, 20), S({ baseThickness: 0, minHeight: 0, detail: "high" }));
    expect(r.watertight).toBe(true);
  });
});

describe("logo extrude (traced)", () => {
  it("traces a ring with a hole and keeps it open", async () => {
    const mf = await getManifold();
    const r = buildLogo(mf, png("logo.png"), S({ mode: "extrude", width: 100, extrudeHeight: 3 }));
    expect(r.watertight).toBe(true);
    expect(Math.abs(r.size[0] - 100)).toBeLessThan(0.01);
    expect(r.size[2]).toBeCloseTo(3, 3);
    const m = new mf.Manifold(new mf.Mesh({ numProp: 3, vertProperties: r.parts[0].positions, triVerts: r.parts[0].indices }));
    const comps = m.decompose();
    expect(comps.map((c) => c.genus()).sort()).toEqual([0, 1]); // bar + ring
    comps.forEach((c) => c.delete());
    m.delete();
  });

  it("base, keyring and brightness levels stay watertight", async () => {
    const mf = await getManifold();
    for (const logoBase of ["none", "rect", "outline"] as const)
      for (const keyring of [false, true]) {
        const r = buildLogo(mf, png("logo.png"), S({ mode: "extrude", logoBase, keyring, heightMode: "brightness", levels: 2 }));
        expect(analyze(mergeMeshes(r.parts)).volume).toBeGreaterThan(0);
        expect(r.watertight, `${logoBase}/${keyring}`).toBe(true);
      }
  });

  it("background removal works on a coloured background", async () => {
    const mf = await getManifold();
    const w = 40, h = 30;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const x = i % w, y = Math.floor(i / w);
      const inside = x > 10 && x < 30 && y > 8 && y < 22;
      data.set(inside ? [250, 220, 0, 255] : [20, 120, 200, 255], i * 4);
    }
    const r = buildLogo(mf, { data, width: w, height: h }, S({ mode: "extrude", removeBackground: true, width: 50, outlineSmooth: 0 }));
    expect(Math.abs(r.size[0] - 50)).toBeLessThan(0.01);
    expect(r.size[1]).toBeCloseTo(50 * (13 / 19), 1);
  });

  it("reports a clear error when nothing is found", async () => {
    const mf = await getManifold();
    const data = new Uint8ClampedArray(10 * 10 * 4).fill(255);
    expect(() => buildLogo(mf, { data, width: 10, height: 10 }, S({ mode: "extrude", threshold: 100 }))).toThrow(/No shape was found/);
  });
});
