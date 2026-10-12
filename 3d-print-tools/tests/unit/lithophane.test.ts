import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getManifold } from "@/lib/geometry/manifold";
import { buildLithophane, thicknessField } from "@/lib/engines/lithophane/build";
import { LITHO_DEFAULTS, type LithoSettings } from "@/lib/engines/lithophane/settings";
import { cropRect, thicknessFor } from "@/lib/engines/lithophane/adjust";
import { loadFont } from "@/lib/engines/text";
import type { Rgba } from "@/lib/engines/image/pixels";

const S = (p: Partial<LithoSettings> = {}): LithoSettings => ({ ...LITHO_DEFAULTS, resolution: 60, ...p });

function gradient(w: number, h: number): Rgba {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = Math.round((x / (w - 1)) * 255);
      data.set([v, v, v, 255], (y * w + x) * 4);
    }
  return { data, width: w, height: h };
}

const font = () =>
  loadFont("inter", async (p) => {
    const b = readFileSync(join(__dirname, "../../public", p));
    return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  });

describe("thickness mapping", () => {
  it("black → max, white → min", () => {
    expect(thicknessFor(0, 0.6, 3)).toBeCloseTo(3);
    expect(thicknessFor(1, 0.6, 3)).toBeCloseTo(0.6);
    const { t, nx } = thicknessField(gradient(60, 10), S({ resolution: 60 }));
    expect(t[0]).toBeCloseTo(3, 3); // left column black
    expect(t[nx - 1]).toBeCloseTo(0.6, 3); // right column white
  });

  it("invert flips the mapping", () => {
    const { t, nx } = thicknessField(gradient(60, 10), S({ invert: true }));
    expect(t[0]).toBeCloseTo(0.6, 3);
    expect(t[nx - 1]).toBeCloseTo(3, 3);
  });

  it("crop keeps the requested aspect", () => {
    const r = cropRect(400, 300, 1, 2, 1, -1);
    expect(r.w / r.h).toBeCloseTo(1);
    expect(r.w).toBeCloseTo(150);
    expect(r.x + r.w).toBeCloseTo(400); // panned fully right
    expect(r.y).toBeCloseTo(0); // panned fully up
  });
});

describe("lithophane shapes", () => {
  for (const shape of ["flat", "arc", "cylinder", "heart", "circle"] as const) {
    it(`${shape} is watertight`, async () => {
      const mf = await getManifold();
      const r = buildLithophane(mf, gradient(80, 60), S({ shape }));
      expect(r.watertight).toBe(true);
      expect(r.volume).toBeGreaterThan(0);
      expect(r.thickness[0].length).toBe(r.parts[0].positions.length / 3);
    });
  }

  it("flat panel without border is exactly the requested width and stands upright", async () => {
    const mf = await getManifold();
    const r = buildLithophane(mf, gradient(80, 40), S({ frame: "none", width: 120 }));
    expect(Math.abs(r.size[0] - 120)).toBeLessThan(0.01);
    expect(Math.abs(r.size[2] - 60)).toBeLessThan(0.01); // image height is vertical
    expect(r.size[1]).toBeLessThanOrEqual(3 + 0.01); // thickness
  });

  it("border adds the frame width on each side", async () => {
    const mf = await getManifold();
    const r = buildLithophane(mf, gradient(80, 40), S({ frame: "border", frameWidth: 3, width: 100 }));
    expect(Math.abs(r.size[0] - 106)).toBeLessThan(0.01);
  });

  it("cylinder outer diameter matches the width", async () => {
    const mf = await getManifold();
    // Rims are at max thickness, so they define the outer diameter (polygonal, hence ±0.1 mm).
    const r = buildLithophane(mf, gradient(120, 60), S({ shape: "cylinder", width: 80, frame: "border", cylinderBase: "open", resolution: 200 }));
    expect(Math.abs(r.size[0] - 80)).toBeLessThan(0.1);
    expect(r.watertight).toBe(true);
  });

  it("extras (frame, stand, holes, text) stay watertight", async () => {
    const mf = await getManifold();
    const f = await font();
    const combos: Partial<LithoSettings>[] = [
      { frame: "frame", stand: true, hole: "none", text: "Mum & Dad" },
      { hole: "tab", text: "2026", textStyle: "raised", textPosition: "top" },
      { hole: "loop" },
      { hole: "inside", text: "Hi" },
      { shape: "arc", hole: "tab", text: "Arc", frame: "frame" },
      { shape: "heart", hole: "tab", frame: "frame" },
      { shape: "circle", hole: "loop" },
    ];
    for (const c of combos) {
      const r = buildLithophane(mf, gradient(80, 60), S(c), f);
      expect(r.watertight, JSON.stringify(c)).toBe(true);
    }
  });
});
