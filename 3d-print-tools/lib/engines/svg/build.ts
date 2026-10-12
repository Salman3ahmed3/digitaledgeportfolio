import type { CrossSection, Manifold } from "manifold-3d/manifold";
import { fromManifold, scoped, type MF } from "@/lib/geometry/manifold";
import { analyze, bounds, size, type Mesh } from "@/lib/geometry/mesh";
import type { BuildResult, Layer, Poly, VectorInput } from "../types";
import { UserError } from "../types";
import { extrudeAt, extrudeBevel, fillHoles, keyringLoop, plateFor, strokeToCs } from "../shapes";
import type { LayerOverride, SvgSettings } from "./settings";

type Keep = <U extends { delete(): void }>(x: U) => U;

export interface VectorBuildInput {
  input: VectorInput;
  settings: SvgSettings;
  /** Colours treated as background and skipped. */
  hiddenColors?: string[];
  layers?: Record<string, LayerOverride>;
}

interface Region {
  layer: Layer;
  cs: CrossSection;
}

/** Turn layers into 2D regions in mm (centred, Y up), scaled to the real width. */
function regions(mf: MF, keep: Keep, { input, settings, hiddenColors = [], layers = {} }: VectorBuildInput): { regions: Region[]; scale: number; warnings: string[] } {
  const warnings: string[] = [];
  const visible = input.layers.filter((l) => !hiddenColors.includes(l.color) && layers[l.id]?.visible !== false);
  if (!visible.length) throw new UserError("no_layers", "All layers are hidden. Turn on at least one layer, or switch off background removal.");

  // Scale from the bounds of the visible geometry only.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const l of visible) {
    const all: Poly[] = [...l.fills.flatMap((f) => f.polys), ...(settings.includeStrokes ? l.strokes.map((s) => s.points) : [])];
    for (const p of all) for (const [x, y] of p) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (!Number.isFinite(minX)) throw new UserError("no_shapes", "This SVG has no closed shapes. Turn on “Include strokes” or set a Line width so outlines become solid.");
  const srcW = Math.max(maxX - minX, 1e-9);
  const scale = settings.width / srcW;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const tx = (p: Poly): Poly => p.map(([x, y]) => [(x - cx) * scale, -(y - cy) * scale]);

  const out: Region[] = [];
  let openSkipped = 0;
  for (const l of visible) {
    const pieces: CrossSection[] = [];
    for (const f of l.fills) {
      // Y-flip mirrors orientation; fill rules are orientation-independent except "Positive".
      const polys = f.polys.map(tx);
      pieces.push(keep(new mf.CrossSection(polys, f.rule)));
    }
    if (!settings.closeShapes && l.openFillPaths) openSkipped += l.openFillPaths;
    if (settings.includeStrokes) {
      for (const s of l.strokes) {
        const w = settings.lineWidth > 0 ? settings.lineWidth : s.width * scale;
        const cs = strokeToCs(mf, keep, tx(s.points), s.closed, w);
        if (cs) pieces.push(cs);
      }
    }
    if (!pieces.length) continue;
    const cs = keep(mf.CrossSection.union(pieces));
    if (!cs.isEmpty()) out.push({ layer: l, cs });
  }
  if (openSkipped) warnings.push(`${openSkipped} open path(s) were closed automatically.`);
  if (!out.length) {
    throw new UserError("no_shapes", "This SVG has no closed shapes. Turn on “Include strokes” or set a Line width so outlines become solid.");
  }
  const tiny = out.every((r) => r.cs.area() < 1);
  if (tiny) warnings.push("The shapes are very small at this width. Increase the real width or line width.");
  return { regions: out, scale, warnings };
}

interface NamedSolid { name: string; color?: string; m: Manifold }

function solids(mf: MF, keep: Keep, b: VectorBuildInput): { list: NamedSolid[]; warnings: string[] } {
  const s = b.settings;
  const { regions: regs, warnings } = regions(mf, keep, b);
  const union2d = () => keep(mf.CrossSection.union(regs.map((r) => r.cs)));
  const list: NamedSolid[] = [];

  if (s.mode === "extrude") {
    const z0 = s.baseThickness > 0 ? s.baseThickness : 0;
    if (s.baseThickness > 0) {
      const plate = plateFor(mf, keep, union2d(), "rounded", s.baseMargin, 2);
      list.push({ name: "Base", color: "#9ca3af", m: extrudeAt(mf, keep, plate, s.baseThickness, 0) });
    }
    for (const r of regs) {
      const o = b.layers?.[r.layer.id];
      const h = o?.height ?? s.height;
      const z = z0 + (o?.z ?? 0);
      // Embed slightly into the base so the union is one solid.
      const embed = s.baseThickness > 0 && z <= z0 + 1e-6 ? 0.01 : 0;
      list.push({ name: r.layer.name, color: r.layer.color, m: extrudeBevel(mf, keep, r.cs, h + embed, z - embed, s.bevel) });
    }
  } else if (s.mode === "stencil") {
    const art = union2d();
    const plate = plateFor(mf, keep, art, "rounded", s.plateMargin, 3);
    const body = extrudeAt(mf, keep, plate, s.plateThickness, 0);
    const depth = s.stencilCut === "through" ? s.plateThickness + 2 : Math.min(s.recessDepth, s.plateThickness - 0.4);
    const z = s.stencilCut === "through" ? -1 : s.plateThickness - depth;
    const cut = extrudeAt(mf, keep, art, depth + (s.stencilCut === "through" ? 0 : 1), z);
    list.push({ name: "Stencil", color: "#64748b", m: keep(body.subtract(cut)) });
    if (s.stencilCut === "through" && art.toPolygons().some((p) => p.length && isHoleOf(p as Poly))) {
      warnings.push("Enclosed areas (like the middle of an “O”) fall out of a through-cut stencil. Add bridges in your design, or use Recess.");
    }
  } else if (s.mode === "keychain") {
    const art = union2d();
    let room = art;
    if (s.loop === "hole") {
      // Reserve space for the hole beside the artwork so it never cuts into it.
      const ab = art.bounds();
      const k = s.holeDiameter + 4;
      const at: [number, number] =
        s.loopPosition === "top" ? [(ab.min[0] + ab.max[0]) / 2, ab.max[1] + k / 2]
        : s.loopPosition === "left" ? [ab.min[0] - k / 2, (ab.min[1] + ab.max[1]) / 2]
        : [ab.max[0] + k / 2, (ab.min[1] + ab.max[1]) / 2];
      room = keep(art.add(keep(mf.CrossSection.circle(k / 2, 32).translate(at))));
    }
    let plate = plateFor(mf, keep, room, s.plateShape, s.plateMargin, 4);
    const loop = keyringLoop(mf, keep, plate, s.loop, s.loopPosition, s.holeDiameter);
    if (loop.add) plate = keep(plate.add(loop.add));
    if (loop.hole) plate = keep(plate.subtract(loop.hole));
    const t = s.plateThickness;
    const d = Math.min(s.artDepth, s.artStyle === "raised" ? 20 : t - 0.6);
    if (s.artStyle === "raised") {
      list.push({ name: "Plate", color: "#e5e7eb", m: extrudeAt(mf, keep, plate, t, 0) });
      const clipped = keep(art.intersect(plate));
      list.push({ name: "Artwork", color: regs[0]?.layer.color ?? "#1f2937", m: extrudeBevel(mf, keep, clipped, d + 0.01, t - 0.01, s.bevel) });
    } else {
      const clipped = keep(art.intersect(plate));
      const pocket = extrudeAt(mf, keep, clipped, d + 1, t - d);
      list.push({ name: "Plate", color: "#e5e7eb", m: keep(extrudeAt(mf, keep, plate, t, 0).subtract(pocket)) });
      if (s.artStyle === "flush") list.push({ name: "Inlay", color: regs[0]?.layer.color ?? "#1f2937", m: extrudeAt(mf, keep, clipped, d, t - d) });
    }
  } else {
    // Cookie cutter: follow the outer silhouette only.
    const outline = fillHoles(mf, keep, union2d());
    const wall = keep(keep(outline.offset(s.wallThickness, "Round", 2, 32)).subtract(outline));
    const flange = keep(keep(outline.offset(s.wallThickness + s.flangeWidth, "Round", 2, 32)).subtract(outline));
    list.push({ name: "Cutter", color: "#f59e0b", m: keep(extrudeAt(mf, keep, wall, s.cutterHeight, 0).add(extrudeAt(mf, keep, flange, s.flangeThickness, 0))) });
  }
  return { list, warnings };
}

/** True for clockwise (hole) contours in Manifold's output. */
function isHoleOf(p: Poly) {
  let a = 0;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] - p[i][0]) * (p[j][1] + p[i][1]);
  return a > 0;
}

export function buildVector(mf: MF, b: VectorBuildInput): BuildResult {
  return scoped((keep) => {
    const { list, warnings } = solids(mf, keep, b);
    const parts = list
      .filter((p) => !p.m.isEmpty())
      .map((p) => {
        const mesh: Mesh = fromManifold(p.m);
        return { name: p.name, color: p.color, ...mesh };
      });
    if (!parts.length) throw new UserError("empty_result", "Nothing was generated. Check the layer visibility and sizes.");
    // Sit on the plate, centred.
    const bb = bounds(parts);
    const dx = -(bb.min[0] + bb.max[0]) / 2, dy = -(bb.min[1] + bb.max[1]) / 2, dz = -bb.min[2];
    for (const p of parts) for (let i = 0; i < p.positions.length; i += 3) {
      p.positions[i] += dx; p.positions[i + 1] += dy; p.positions[i + 2] += dz;
    }
    let watertight = true, volume = 0, triangles = 0;
    for (const p of parts) {
      const st = analyze(p, true);
      watertight &&= st.watertight;
      volume += st.volume;
      triangles += st.triangles;
    }
    return { parts, size: size(bounds(parts)), triangles, volume, watertight, warnings };
  });
}

/** Union of all parts into one solid (for single-body formats like STL). */
export function unionParts(mf: MF, parts: Mesh[]): Mesh {
  return scoped((keep) => {
    const ms = parts.map((p) => {
      const m = new mf.Mesh({ numProp: 3, vertProperties: p.positions, triVerts: p.indices });
      m.merge();
      return keep(new mf.Manifold(m));
    });
    return fromManifold(keep(mf.Manifold.union(ms)));
  });
}
