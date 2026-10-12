import type { CrossSection, Manifold } from "manifold-3d/manifold";
import type { Font } from "opentype.js";
import { fromManifold, scoped, type MF } from "@/lib/geometry/manifold";
import { analyze, bounds, size, type Mesh } from "@/lib/geometry/mesh";
import { gridSolid, resample } from "../image/heightmap";
import { luminance, type Rgba } from "../image/pixels";
import { keyringLoop } from "../shapes";
import { textToVector } from "../text";
import type { BuildResult, BuiltPart, Poly } from "../types";
import { UserError } from "../types";
import { adjustLuminance, thicknessFor } from "./adjust";
import type { LithoSettings } from "./settings";

type Keep = <U extends { delete(): void }>(x: U) => U;

export interface LithoResult extends BuildResult {
  /** Per-part, per-vertex wall thickness in mm (for backlit/heightmap previews). */
  thickness: Float32Array[];
}

/** Thickness field (row 0 = top of the image) from a cropped image. */
export function thicknessField(img: Rgba, s: LithoSettings): { t: Float32Array; nx: number; ny: number } {
  const lum = adjustLuminance(luminance(img), s);
  const k = s.resolution / Math.max(img.width, img.height);
  const nx = Math.max(2, Math.round(img.width * k));
  const ny = Math.max(2, Math.round(img.height * k));
  const f = resample(lum, img.width, img.height, nx, ny);
  const t = new Float32Array(nx * ny);
  const lo = Math.min(s.minThickness, s.maxThickness), hi = Math.max(s.minThickness, s.maxThickness);
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) t[j * nx + i] = thicknessFor(f[j * nx + (s.mirror ? nx - 1 - i : i)], lo, hi);
  return { t, nx, ny };
}

/**
 * Closed tube with a relief on the outside: outer surface follows the
 * thickness grid (wrapping around), inner wall at radius R, flat rims.
 */
export function tubeSolid(t: Float32Array, nx: number, ny: number, R: number, H: number): Mesh {
  const nOuter = nx * ny;
  const positions = new Float32Array((nOuter + 2 * nx) * 3);
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const a = (2 * Math.PI * i) / nx, r = R + t[j * nx + i], v = j * nx + i;
      positions[v * 3] = r * Math.cos(a);
      positions[v * 3 + 1] = r * Math.sin(a);
      positions[v * 3 + 2] = H * (1 - j / (ny - 1));
    }
  const IT = nOuter, IB = nOuter + nx;
  for (let i = 0; i < nx; i++) {
    const a = (2 * Math.PI * i) / nx;
    for (const [base, z] of [[IT, H], [IB, 0]] as const) {
      positions[(base + i) * 3] = R * Math.cos(a);
      positions[(base + i) * 3 + 1] = R * Math.sin(a);
      positions[(base + i) * 3 + 2] = z;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < ny - 1; j++)
    for (let i = 0; i < nx; i++) {
      const i1 = (i + 1) % nx;
      const a = j * nx + i, b = j * nx + i1, c = a + nx, d = b + nx;
      idx.push(c, d, b, c, b, a);
    }
  const bot = (ny - 1) * nx;
  for (let i = 0; i < nx; i++) {
    const i1 = (i + 1) % nx;
    idx.push(i, i1, IT + i1, i, IT + i1, IT + i); // top rim
    idx.push(bot + i, IB + i1, bot + i1, bot + i, IB + i, IB + i1); // bottom rim
    idx.push(IT + i, IB + i1, IB + i, IT + i, IT + i1, IB + i1); // inner wall
  }
  return { positions, indices: new Uint32Array(idx) };
}

function heartPoly(w: number, segs = 160): Poly {
  const pts: Poly = [];
  for (let k = 0; k < segs; k++) {
    const a = (k / segs) * Math.PI * 2;
    pts.push([16 * Math.sin(a) ** 3, 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)]);
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const k = w / Math.max(maxX - minX, maxY - minY);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  return pts.map(([x, y]) => [(x - cx) * k, (y - cy) * k]);
}

function rect(mf: MF, keep: Keep, x0: number, y0: number, x1: number, y1: number): CrossSection {
  return keep(mf.CrossSection.square([x1 - x0, y1 - y0]).translate([x0, y0]));
}

function slab(mf: MF, keep: Keep, cs: CrossSection, z0: number, z1: number): Manifold {
  return keep(keep(cs.extrude(z1 - z0)).translate([0, 0, z0]));
}

function meshManifold(mf: MF, keep: Keep, mesh: Mesh): Manifold {
  const m = new mf.Mesh({ numProp: 3, vertProperties: mesh.positions, triVerts: mesh.indices });
  m.merge();
  return keep(new mf.Manifold(m));
}

/** Text fitted into a band (panel space, mm). */
function textRegion(mf: MF, keep: Keep, font: Font, text: string, cx: number, cy: number, maxW: number, maxH: number): CrossSection | null {
  const v = textToVector(font, text);
  const { minX, minY, maxX, maxY } = v.bounds;
  const k = Math.min(maxW / (maxX - minX), maxH / (maxY - minY));
  const polys = v.layers[0].fills[0].polys.map((p) => p.map(([x, y]) => [cx + (x - (minX + maxX) / 2) * k, cy - (y - (minY + maxY) / 2) * k] as [number, number]));
  const cs = keep(new mf.CrossSection(polys, "NonZero"));
  return cs.isEmpty() ? null : cs;
}

export function buildLithophane(mf: MF, img: Rgba, s: LithoSettings, font?: Font): LithoResult {
  if (s.maxThickness <= s.minThickness) throw new UserError("thickness", "Max thickness must be greater than min thickness.");
  const { t, nx, ny } = thicknessField(img, s);
  const tMax = Math.max(s.minThickness, s.maxThickness);
  const warnings: string[] = [];

  return scoped((keep) => {
    let solid: Manifold;
    let thicknessOf: (x: number, y: number, z: number) => number;

    if (s.shape === "cylinder") {
      const R = s.width / 2 - tMax; // outer diameter ≈ width
      if (R < 5) throw new UserError("cylinder_small", "The cylinder is too small for this thickness. Increase the diameter.");
      // Solid rims top and bottom (border/frame) for strength.
      const H = s.cylinderHeight;
      const rim = s.frame === "none" ? 0 : s.frame === "frame" ? Math.max(s.frameWidth, 2) : s.frameWidth;
      const dz = H / (ny - 1);
      const rimRows = rim > 0 ? Math.max(1, Math.round(rim / dz)) : 0;
      const ny2 = ny + 2 * rimRows;
      const t2 = new Float32Array(nx * ny2).fill(s.frame === "frame" ? Math.max(tMax, s.frameDepth) : tMax);
      t2.set(t, rimRows * nx);
      solid = meshManifold(mf, keep, tubeSolid(t2, nx, ny2, R, H + 2 * rimRows * dz));
      if (s.cylinderBase === "ring") {
        let disc = keep(mf.CrossSection.circle(R + s.minThickness / 2, 128));
        if (s.lightHole > 0 && s.lightHole < 2 * R - 4) disc = keep(disc.subtract(keep(mf.CrossSection.circle(s.lightHole / 2, 96))));
        else if (s.lightHole > 0) warnings.push("The light hole is larger than the cylinder base and was left out.");
        solid = keep(solid.add(slab(mf, keep, disc, 0, 2)));
      }
      thicknessOf = (x, y) => Math.hypot(x, y) - R;
    } else {
      // ---- panel space: image centred on the origin, back at z = 0, relief towards +z
      const W = s.width;
      const H = (W * ny) / nx;
      const sheet = gridSolid({ z: t, nx, ny, sizeX: W, sizeY: H });
      for (let i = 0; i < sheet.positions.length; i += 3) {
        sheet.positions[i] -= W / 2;
        sheet.positions[i + 1] -= H / 2;
      }
      solid = meshManifold(mf, keep, sheet);

      // Outline of the picture area (shape for heart/circle).
      let area: CrossSection;
      if (s.shape === "heart" || s.shape === "circle") {
        area = s.shape === "circle" ? keep(mf.CrossSection.circle(W * 0.495, 160)) : keep(new mf.CrossSection([heartPoly(W * 0.99)], "NonZero"));
        solid = keep(solid.intersect(slab(mf, keep, area, -1, tMax + 1)));
      } else {
        area = rect(mf, keep, -W / 2, -H / 2, W / 2, H / 2);
      }

      // Solid bands (text, inside hanging hole) extend the outline.
      let outline = area;
      const solidBands: CrossSection[] = [];
      const flatLike = s.shape === "flat" || s.shape === "arc";
      let textCs: CrossSection | null = null;
      if (flatLike && s.text.trim() && font) {
        const bh = Math.max(6, (H * s.textSize) / 100);
        const top = s.textPosition === "top";
        const y0 = top ? H / 2 - 0.02 : -H / 2 - bh;
        const y1 = top ? H / 2 + bh : -H / 2 + 0.02;
        const band = rect(mf, keep, -W / 2, y0, W / 2, y1);
        solidBands.push(band);
        textCs = textRegion(mf, keep, font, s.text, 0, (y0 + y1) / 2, W * 0.9, bh * 0.7);
      }
      if (flatLike && s.hole === "inside") {
        const ob = keep(mf.CrossSection.union([area, ...solidBands])).bounds();
        const bh = s.holeDiameter + 5;
        solidBands.push(rect(mf, keep, -W / 2, ob.max[1] - 0.02, W / 2, ob.max[1] + bh));
      }
      if (solidBands.length) outline = keep(mf.CrossSection.union([area, ...solidBands]));

      // Border / frame around everything.
      let ring: CrossSection | null = null;
      if (s.frame !== "none" && s.frameWidth > 0) {
        const outer = keep(outline.offset(s.frameWidth, s.shape === "flat" || s.shape === "arc" ? "Miter" : "Round", 2, 64));
        ring = keep(outer.subtract(keep(outline.offset(-0.02, "Miter"))));
        outline = outer;
      }
      const frameTop = s.frame === "frame" ? Math.max(tMax, s.frameDepth) : tMax;
      const adds: Manifold[] = [];
      for (const b of solidBands) adds.push(slab(mf, keep, b, 0, tMax));
      if (ring) adds.push(slab(mf, keep, ring, 0, frameTop));

      // Hanging tab / loop.
      let holeCs: CrossSection | null = null;
      if (s.hole === "tab" || s.hole === "loop") {
        const l = keyringLoop(mf, keep, outline, "tab", "top", s.holeDiameter);
        let add = l.add!;
        if (s.hole === "loop") {
          // Slimmer ring: trim the tab's disc down to a 1.6 mm wall.
          const ob = l.hole!.bounds();
          const c: [number, number] = [(ob.min[0] + ob.max[0]) / 2, (ob.min[1] + ob.max[1]) / 2];
          const ringOuter = keep(mf.CrossSection.circle(s.holeDiameter / 2 + 1.6, 64).translate(c));
          const neck = rect(mf, keep, c[0] - 2, outline.bounds().max[1] - 0.5, c[0] + 2, c[1]);
          add = keep(ringOuter.add(neck));
        }
        adds.push(slab(mf, keep, add, 0, Math.min(tMax, 3)));
        holeCs = l.hole;
      } else if (s.hole === "inside" && flatLike) {
        const ob = outline.bounds();
        holeCs = keep(mf.CrossSection.circle(s.holeDiameter / 2, 48).translate([0, ob.max[1] - (s.frame !== "none" ? s.frameWidth : 0) - s.holeDiameter / 2 - 2.5]));
      }

      // Stand (flat only): a foot under the bottom edge, deep enough to stand.
      if (s.stand && s.shape === "flat") {
        const ob = outline.bounds();
        const depth = Math.max(20, W * 0.2);
        const foot = keep(mf.Manifold.cube([ob.max[0] - ob.min[0], 5, depth]).translate([ob.min[0], ob.min[1] - 4.5, tMax / 2 - depth / 2]));
        adds.push(foot);
      }

      if (adds.length) solid = keep(mf.Manifold.union([solid, ...adds]));

      if (textCs) {
        if (s.textStyle === "raised") solid = keep(solid.add(slab(mf, keep, textCs, tMax - 0.01, tMax + 0.8)));
        else solid = keep(solid.subtract(slab(mf, keep, textCs, tMax - Math.min(1, tMax / 2), tMax + 1)));
      }
      if (holeCs) solid = keep(solid.subtract(slab(mf, keep, holeCs, -50, 50)));

      // ---- to print orientation: image up = +Z, relief facing −Y.
      if (s.shape === "arc") {
        const A = (Math.max(10, Math.min(s.arcAngle, 300)) * Math.PI) / 180;
        const R = W / A;
        solid = keep(keep(solid.refineToLength(Math.max(W / 120, 0.5))).warp((v) => {
          const th = v[0] / R, r = R + v[2], y = v[1];
          const zp = r * Math.cos(th) - R;
          v[0] = r * Math.sin(th);
          v[1] = -zp;
          v[2] = y;
        }));
        thicknessOf = (x, y) => Math.hypot(x, y - R) - R;
      } else {
        solid = keep(solid.warp((v) => {
          const y = v[1];
          v[1] = -v[2];
          v[2] = y;
        }));
        thicknessOf = (_x, y) => -y;
      }
    }

    if (solid.status() !== "NoError") throw new UserError("geometry", "The lithophane geometry couldn't be built. Try a different resolution or thickness.");
    const mesh = fromManifold(solid);
    const th = new Float32Array(mesh.positions.length / 3);
    for (let i = 0; i < th.length; i++) th[i] = thicknessOf(mesh.positions[i * 3], mesh.positions[i * 3 + 1], mesh.positions[i * 3 + 2]);
    const part: BuiltPart = { name: "Lithophane", color: "#f4f1ea", ...mesh };
    const bb = bounds(part);
    const dx = -(bb.min[0] + bb.max[0]) / 2, dy = -(bb.min[1] + bb.max[1]) / 2, dzz = -bb.min[2];
    for (let i = 0; i < part.positions.length; i += 3) {
      part.positions[i] += dx; part.positions[i + 1] += dy; part.positions[i + 2] += dzz;
    }
    const st = analyze(part, true);
    return { parts: [part], size: size(bounds(part)), triangles: st.triangles, volume: st.volume, watertight: st.watertight, warnings, thickness: [th] };
  });
}
