import type { Aspect, LithoSettings } from "./settings";

/** Target width/height ratio of the image area for the current shape. */
export function targetAspect(s: Pick<LithoSettings, "shape" | "aspect" | "width" | "cylinderHeight">, imgW: number, imgH: number): number {
  if (s.shape === "heart" || s.shape === "circle") return 1;
  if (s.shape === "cylinder") return (Math.PI * s.width) / s.cylinderHeight;
  const map: Record<Exclude<Aspect, "original">, number> = { "1:1": 1, "4:3": 4 / 3, "3:4": 3 / 4, "16:9": 16 / 9, "9:16": 9 / 16 };
  return s.aspect === "original" ? imgW / imgH : map[s.aspect];
}

/** Crop rectangle (image pixels) for aspect, zoom (≥1) and pan (−1…1). */
export function cropRect(imgW: number, imgH: number, aspect: number, zoom: number, panX: number, panY: number) {
  let w = imgW, h = imgW / aspect;
  if (h > imgH) {
    h = imgH;
    w = imgH * aspect;
  }
  w /= Math.max(1, zoom);
  h /= Math.max(1, zoom);
  const x = (imgW - w) / 2 + (panX * (imgW - w)) / 2;
  const y = (imgH - h) / 2 + (panY * (imgH - h)) / 2;
  return { x, y, w, h };
}

/**
 * Brightness/contrast/gamma/auto-enhance/invert on a 0–1 luminance field
 * (in place). Shared by the 2D preview and the mesh builder.
 */
export function adjustLuminance(lum: Float32Array, s: Pick<LithoSettings, "brightness" | "contrast" | "gamma" | "autoEnhance" | "invert">): Float32Array {
  let lo = 0, hi = 1;
  if (s.autoEnhance) {
    // Stretch between the 1st and 99th percentiles.
    const hist = new Uint32Array(256);
    for (const v of lum) hist[Math.min(255, Math.max(0, Math.round(v * 255)))]++;
    const cut = lum.length * 0.01;
    let acc = 0, a = 0, b = 255;
    for (let i = 0; i < 256; i++) if ((acc += hist[i]) > cut) { a = i; break; }
    acc = 0;
    for (let i = 255; i >= 0; i--) if ((acc += hist[i]) > cut) { b = i; break; }
    if (b > a) {
      lo = a / 255;
      hi = b / 255;
    }
  }
  const c = s.contrast >= 0 ? 1 + s.contrast * 3 : 1 + s.contrast;
  for (let i = 0; i < lum.length; i++) {
    let v = (lum[i] - lo) / (hi - lo);
    v = (v - 0.5) * c + 0.5 + s.brightness * 0.5;
    v = Math.min(1, Math.max(0, v));
    if (s.gamma !== 1) v = Math.pow(v, 1 / s.gamma);
    if (s.invert) v = 1 - v;
    lum[i] = v;
  }
  return lum;
}

/** Lithophane rule: dark = thick. thickness = min + (1 − luminance) × (max − min). */
export const thicknessFor = (lum: number, min: number, max: number) => min + (1 - lum) * (max - min);
