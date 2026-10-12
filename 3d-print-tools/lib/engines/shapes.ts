import type { CrossSection, Manifold } from "manifold-3d/manifold";
import type { MF } from "@/lib/geometry/manifold";
import type { Poly } from "./types";

type Keep = <U extends { delete(): void }>(x: U) => U;

export const polyArea = (p: Poly) => {
  let a = 0;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]);
  return -a / 2;
};

const ccw = (p: Poly): Poly => (polyArea(p) < 0 ? [...p].reverse() : p);

function circlePoly(cx: number, cy: number, r: number, segs: number): Poly {
  const out: Poly = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
}

/** Thick polyline (round joins and caps) as a CrossSection. */
export function strokeToCs(mf: MF, keep: Keep, points: Poly, closed: boolean, width: number): CrossSection | null {
  if (points.length < 2 || width <= 0) return null;
  const r = width / 2;
  const segs = Math.max(8, Math.min(32, Math.round(r * 6)));
  const polys: Poly[] = [];
  const n = points.length;
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % n];
    const dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) continue;
    const nx = (-dy / len) * r, ny = (dx / len) * r;
    polys.push(ccw([[x0 + nx, y0 + ny], [x0 - nx, y0 - ny], [x1 - nx, y1 - ny], [x1 + nx, y1 + ny]]));
  }
  for (let i = 0; i < n; i++) polys.push(circlePoly(points[i][0], points[i][1], r, segs));
  if (!polys.length) return null;
  return keep(new mf.CrossSection(polys, "Positive"));
}

/** Only the outer contours of a region (fills every hole). */
export function fillHoles(mf: MF, keep: Keep, cs: CrossSection): CrossSection {
  const outer = cs.toPolygons().filter((p) => polyArea(p as Poly) > 0);
  return keep(new mf.CrossSection(outer as Poly[], "Positive"));
}

export type PlateShape = "rounded" | "circle" | "hex" | "outline" | "rect";

/** Backing plate around `art` with `margin` mm clearance. */
export function plateFor(mf: MF, keep: Keep, art: CrossSection, shape: PlateShape, margin: number, corner = 3): CrossSection {
  const b = art.bounds();
  const cx = (b.min[0] + b.max[0]) / 2, cy = (b.min[1] + b.max[1]) / 2;
  const w = b.max[0] - b.min[0] + margin * 2, h = b.max[1] - b.min[1] + margin * 2;
  switch (shape) {
    case "rect":
      return keep(mf.CrossSection.square([w, h], true).translate([cx, cy]));
    case "rounded": {
      const r = Math.min(corner, w / 2 - 0.01, h / 2 - 0.01);
      const inner = keep(mf.CrossSection.square([w - 2 * r, h - 2 * r], true));
      return keep(inner.offset(r, "Round", 2, 48).translate([cx, cy]));
    }
    case "circle": {
      const r = Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1]) / 2 + margin;
      return keep(mf.CrossSection.circle(r, 96).translate([cx, cy]));
    }
    case "hex": {
      const r = (Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1]) / 2 + margin) / Math.cos(Math.PI / 6);
      const pts: Poly = [];
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + (i * Math.PI) / 3;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      return keep(new mf.CrossSection([pts], "Positive"));
    }
    case "outline": {
      const grown = keep(art.offset(margin, "Round", 2, 48));
      return fillHoles(mf, keep, grown);
    }
  }
}

export type LoopStyle = "none" | "tab" | "hole";
export type LoopPosition = "top" | "left" | "right";

/**
 * Keyring loop: returns the solid to add (tab) and the hole to subtract.
 * `plate` is the plate outline the loop attaches to.
 */
export function keyringLoop(
  mf: MF, keep: Keep, plate: CrossSection, style: LoopStyle, position: LoopPosition, holeD: number,
): { add: CrossSection | null; hole: CrossSection | null } {
  if (style === "none") return { add: null, hole: null };
  const b = plate.bounds();
  const ring = Math.max(2, holeD * 0.5); // wall around the hole
  const R = holeD / 2 + ring;
  const cx = position === "top" ? (b.min[0] + b.max[0]) / 2 : position === "left" ? b.min[0] : b.max[0];
  const cy = position === "top" ? b.max[1] : (b.min[1] + b.max[1]) / 2;
  const dir: [number, number] = position === "top" ? [0, 1] : position === "left" ? [-1, 0] : [1, 0];
  if (style === "tab") {
    // Circle centred just outside the edge, bridged to the plate.
    const off = holeD / 2 + 0.5;
    const hx = cx + dir[0] * off, hy = cy + dir[1] * off;
    const disc = keep(mf.CrossSection.circle(R, 64).translate([hx, hy]));
    const bridgeW = R * 2, bridgeL = off + R;
    const bridge = keep(
      mf.CrossSection.square(dir[0] === 0 ? [bridgeW, bridgeL] : [bridgeL, bridgeW], true).translate([cx + (dir[0] * bridgeL) / 2 - dir[0] * R * 0.5, cy + (dir[1] * bridgeL) / 2 - dir[1] * R * 0.5]),
    );
    const add = keep(disc.add(bridge));
    const hole = keep(mf.CrossSection.circle(holeD / 2, 48).translate([hx, hy]));
    return { add, hole };
  }
  // Hole inside the plate, inset from the chosen edge.
  const inset = holeD / 2 + ring;
  const hx = cx - dir[0] * inset, hy = cy - dir[1] * inset;
  return { add: null, hole: keep(mf.CrossSection.circle(holeD / 2, 48).translate([hx, hy])) };
}

export function extrudeAt(mf: MF, keep: Keep, cs: CrossSection, height: number, z = 0): Manifold {
  return keep(keep(cs.extrude(height)).translate([0, 0, z]));
}

/**
 * Extrusion with a stepped chamfer on the top edge ("smooth edges").
 * Approximates a bevel with `steps` inset layers.
 */
export function extrudeBevel(mf: MF, keep: Keep, cs: CrossSection, height: number, z: number, bevel: number, steps = 4): Manifold {
  const b = Math.min(bevel, height * 0.8);
  if (b <= 0.01) return extrudeAt(mf, keep, cs, height, z);
  const parts: Manifold[] = [extrudeAt(mf, keep, cs, height - b, z)];
  for (let i = 1; i <= steps; i++) {
    const inset = keep(cs.offset((-b * i) / steps, "Round", 2, 24));
    if (inset.isEmpty()) break;
    const layerH = b / steps;
    parts.push(extrudeAt(mf, keep, inset, layerH, z + height - b + (i - 1) * layerH));
  }
  return keep(mf.Manifold.union(parts));
}
