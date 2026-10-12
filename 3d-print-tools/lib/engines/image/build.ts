import type { CrossSection, Manifold } from "manifold-3d/manifold";
import { fromManifold, scoped, type MF } from "@/lib/geometry/manifold";
import { analyze, bounds, size, translate, type Mesh } from "@/lib/geometry/mesh";
import type { BuildResult, BuiltPart, Poly } from "../types";
import { UserError } from "../types";
import { keyringLoop, plateFor, extrudeAt } from "../shapes";
import { applyCurve, blur, cornerColor, luminance, otsu, type Rgba } from "./pixels";
import { gridSolid, resample } from "./heightmap";
import { cleanContours, traceMask } from "./trace";
import { DETAIL_STRIDE, type ImageSettings } from "./settings";

function finish(parts: BuiltPart[], warnings: string[]): BuildResult {
  const bb = bounds(parts);
  const dx = -(bb.min[0] + bb.max[0]) / 2, dy = -(bb.min[1] + bb.max[1]) / 2, dz = -bb.min[2];
  let watertight = true, volume = 0, triangles = 0;
  for (const p of parts) {
    translate(p, dx, dy, dz);
    const st = analyze(p, true);
    watertight &&= st.watertight;
    volume += st.volume;
    triangles += st.triangles;
  }
  return { parts, size: size(bounds(parts)), triangles, volume, watertight, warnings };
}

/** Heightmap relief: luminance → height, closed with walls and a flat bottom. */
export function buildHeightmap(img: Rgba, s: ImageSettings): BuildResult {
  const { width: w, height: h } = img;
  if (w < 2 || h < 2) throw new UserError("image_small", "This image is too small. Use an image at least a few pixels wide.");
  let lum = luminance(img);
  if (s.smoothing > 0) lum = blur(lum, w, h, s.smoothing);
  const stride = DETAIL_STRIDE[s.detail];
  const nx = Math.max(2, Math.round(w / stride)), ny = Math.max(2, Math.round(h / stride));
  const field = resample(lum, w, h, nx, ny);
  const z = new Float32Array(nx * ny);
  const lo = s.baseThickness + s.minHeight;
  const hi = s.baseThickness + Math.max(s.maxHeight, s.minHeight);
  const warnings: string[] = [];
  let clamped = false;
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const src = field[j * nx + (s.mirror ? nx - 1 - i : i)];
      const v = applyCurve(s.invert ? 1 - src : src, s.curve, s.gamma);
      let zz = lo + v * (hi - lo);
      if (zz < 0.2) {
        zz = 0.2;
        clamped = true;
      }
      z[j * nx + i] = zz;
    }
  if (clamped) warnings.push("Some areas were thinner than 0.2 mm and were raised to 0.2 mm so the model stays solid. Add a base for a sturdier print.");
  const mesh = gridSolid({ z, nx, ny, sizeX: s.width, sizeY: (s.width * h) / w });
  return finish([{ name: "Relief", color: "#cbd5e1", ...mesh }], warnings);
}

function colorDist(r: number, g: number, b: number, hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return (Math.hypot(r - ((n >> 16) & 255), g - ((n >> 8) & 255), b - (n & 255)) / 441.673) * 100;
}

/** Foreground masks for the logo/extrude mode (index 0 = full shape, then darker levels). */
export function logoMasks(img: Rgba, s: ImageSettings): { masks: Uint8Array[]; threshold: number; bg: string } {
  const { data, width: w, height: h } = img;
  const lum = luminance(img);
  const n = w * h;
  const fg = new Uint8Array(n);
  const bg = s.bgColor || cornerColor(img);
  const t = s.threshold >= 0 ? s.threshold : otsu(lum);
  for (let i = 0; i < n; i++) {
    if (data[i * 4 + 3] < 128) continue;
    let on: boolean;
    if (s.removeBackground) on = colorDist(data[i * 4], data[i * 4 + 1], data[i * 4 + 2], bg) > s.bgTolerance;
    else on = lum[i] * 255 < t;
    if (s.invertMask && !s.removeBackground) on = !on && data[i * 4 + 3] >= 128;
    fg[i] = on ? 1 : 0;
  }
  const masks = [fg];
  if (s.heightMode === "brightness" && s.levels > 1) {
    // Quantise foreground luminance into levels; darker = taller.
    let lo = 1, hi = 0;
    for (let i = 0; i < n; i++) if (fg[i]) { lo = Math.min(lo, lum[i]); hi = Math.max(hi, lum[i]); }
    for (let k = 1; k < s.levels; k++) {
      const cut = s.invertMask ? lo + ((hi - lo) * k) / s.levels : hi - ((hi - lo) * k) / s.levels;
      const m = new Uint8Array(n);
      for (let i = 0; i < n; i++) if (fg[i] && (s.invertMask ? lum[i] > cut : lum[i] < cut)) m[i] = 1;
      masks.push(m);
    }
  }
  return { masks, threshold: t, bg };
}

export function buildLogo(mf: MF, img: Rgba, s: ImageSettings): BuildResult {
  const { width: w, height: h } = img;
  const { masks } = logoMasks(img, s);
  const warnings: string[] = [];
  return scoped((keep) => {
    // Trace + clean every level in pixel space first, then scale from the cleaned
    // outline so the finished width matches the setting exactly.
    const traced: Poly[][] = [];
    for (const m of masks) {
      const polys = cleanContours(traceMask(m, w, h), { minArea: s.minSpeck, smooth: s.outlineSmooth, simplify: s.outlineSimplify });
      if (!polys.length) break;
      traced.push(polys);
    }
    if (!masks[0].some((v) => v === 1)) throw new UserError("no_foreground", "No shape was found. Adjust the threshold, turn on Invert for light artwork on a dark background, or use background removal.");
    if (!traced.length) throw new UserError("no_foreground", "Everything was removed as specks. Lower “Remove specks” or adjust the threshold.");
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of traced[0]) for (const [x, y] of p) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const scale = s.width / Math.max(maxX - minX, 1e-6);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const tx = (p: Poly): Poly => p.map(([x, y]) => [(x - cx) * scale, -(y - cy) * scale]);
    const regions: CrossSection[] = [];
    for (const polys of traced) {
      const cs = keep(new mf.CrossSection(polys.map(tx), "EvenOdd"));
      if (cs.isEmpty()) break;
      regions.push(cs);
    }
    if (!regions.length) throw new UserError("no_foreground", "Everything was removed as specks. Lower “Remove specks” or adjust the threshold.");
    const art = regions[0];
    const hasBase = s.logoBase !== "none";
    const z0 = hasBase ? s.logoBaseThickness : 0;
    // Level k (0 = full shape) reaches (k+1)/N of the height, so darker areas stand taller.
    const embed = hasBase ? 0.01 : 0;
    const stacked = regions.map((r, k) => extrudeAt(mf, keep, r, (s.extrudeHeight * (k + 1)) / regions.length + embed, z0 - embed));
    const logo = keep(mf.Manifold.union(stacked));

    const parts: { name: string; color: string; m: Manifold }[] = [];
    let plate: CrossSection | null = null;
    if (hasBase) plate = plateFor(mf, keep, art, s.logoBase === "rect" ? "rounded" : "outline", s.logoBaseMargin, 2);
    if (s.keyring) {
      const host = plate ?? keep(art.offset(0.01, "Round", 2, 16));
      const loop = keyringLoop(mf, keep, host, "tab", s.keyringPosition, s.holeDiameter);
      const t = hasBase ? s.logoBaseThickness : s.extrudeHeight;
      if (plate) {
        plate = keep(keep(plate.add(loop.add!)).subtract(loop.hole!));
      } else {
        const tab = keep(loop.add!.subtract(loop.hole!));
        parts.push({ name: "Loop", color: "#94a3b8", m: keep(extrudeAt(mf, keep, tab, t, 0).subtract(extrudeAt(mf, keep, loop.hole!, t + 2, -1))) });
      }
    }
    if (plate) parts.push({ name: "Base", color: "#94a3b8", m: extrudeAt(mf, keep, plate, s.logoBaseThickness, 0) });
    parts.push({ name: "Logo", color: "#2b7fff", m: logo });
    if (regions.length < masks.length) warnings.push("Some brightness levels were empty and were skipped.");

    const built: BuiltPart[] = parts.filter((p) => !p.m.isEmpty()).map((p) => ({ name: p.name, color: p.color, ...(fromManifold(p.m) as Mesh) }));
    return finish(built, warnings);
  });
}

export function buildImage(mf: MF, img: Rgba, s: ImageSettings): BuildResult {
  return s.mode === "heightmap" ? buildHeightmap(img, s) : buildLogo(mf, img, s);
}
