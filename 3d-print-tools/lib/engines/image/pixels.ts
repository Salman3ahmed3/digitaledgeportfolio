/** Raster helpers shared by the image and lithophane engines (pure, worker-safe). */

export interface Rgba {
  data: Uint8ClampedArray | Uint8Array; // RGBA
  width: number;
  height: number;
}

/** Perceived luminance 0–1 (Rec. 709). Transparent pixels count as white. */
export function luminance(img: Rgba): Float32Array {
  const { data, width, height } = img;
  const out = new Float32Array(width * height);
  for (let i = 0; i < out.length; i++) {
    const a = data[i * 4 + 3] / 255;
    const l = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
    out[i] = l * a + (1 - a);
  }
  return out;
}

/** Separable Gaussian blur, radius in pixels (sigma = radius / 2). */
export function blur(src: Float32Array, w: number, h: number, radius: number): Float32Array {
  if (radius <= 0) return src;
  const sigma = Math.max(radius / 2, 0.5);
  const r = Math.ceil(radius);
  const k = new Float32Array(r * 2 + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) sum += k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma));
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let i = -r; i <= r; i++) v += src[y * w + Math.min(w - 1, Math.max(0, x + i))] * k[i + r];
      tmp[y * w + x] = v;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let i = -r; i <= r; i++) v += tmp[Math.min(h - 1, Math.max(0, y + i)) * w + x] * k[i + r];
      out[y * w + x] = v;
    }
  return out;
}

/** Otsu's threshold on 0–1 luminance; returns 0–255. */
export function otsu(lum: Float32Array): number {
  const hist = new Float64Array(256);
  for (const v of lum) hist[Math.min(255, Math.max(0, Math.round(v * 255)))]++;
  const total = lum.length;
  let sumAll = 0;
  for (let i = 0; i < 256; i++) sumAll += i * hist[i];
  let sumB = 0, wB = 0, best = 0, bestT = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB, mF = (sumAll - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) {
      best = between;
      bestT = t;
    }
  }
  return bestT;
}

/** Most common colour among the four corner pixels (hex). */
export function cornerColor(img: Rgba): string {
  const { data, width: w, height: h } = img;
  const idx = [0, w - 1, (h - 1) * w, h * w - 1];
  const colors = idx.map((i) => (data[i * 4] << 16) | (data[i * 4 + 1] << 8) | data[i * 4 + 2]);
  const counts = new Map<number, number>();
  for (const c of colors) counts.set(c, (counts.get(c) ?? 0) + 1);
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  return `#${best.toString(16).padStart(6, "0")}`;
}

export type DepthCurve = "linear" | "ease-in" | "ease-out" | "gamma";

export function applyCurve(v: number, curve: DepthCurve, gamma: number): number {
  switch (curve) {
    case "ease-in":
      return v * v;
    case "ease-out":
      return 1 - (1 - v) * (1 - v);
    case "gamma":
      return Math.pow(v, gamma);
    default:
      return v;
  }
}
