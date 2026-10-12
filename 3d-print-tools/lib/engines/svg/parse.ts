import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { Color } from "three";
import type { Layer, Poly, VectorInput } from "../types";
import { UserError } from "../types";

export type CurveDetail = "low" | "medium" | "high";
const DIVISIONS: Record<CurveDetail, number> = { low: 4, medium: 12, high: 32 };

function hex(c: string | undefined): string | null {
  if (!c || c === "none" || c === "transparent") return null;
  if (c.startsWith("url(")) return "#888888"; // gradients/patterns → neutral grey
  try {
    return `#${new Color().setStyle(c, "srgb").getHexString()}`;
  } catch {
    return "#000000";
  }
}

function clean(points: { x: number; y: number }[]): { poly: Poly; closed: boolean } {
  const out: Poly = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (!last || Math.abs(last[0] - p.x) > 1e-9 || Math.abs(last[1] - p.y) > 1e-9) out.push([p.x, p.y]);
  }
  let closed = false;
  if (out.length > 2) {
    const a = out[0], b = out[out.length - 1];
    if (Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6) {
      out.pop();
      closed = true;
    }
  }
  return { poly: out, closed };
}

/**
 * Parse SVG text into colour layers (requires DOMParser, so runs on the main
 * thread). Transforms and viewBox are applied by SVGLoader; units stay SVG units.
 */
export function parseSvg(text: string, detail: CurveDetail = "medium"): VectorInput {
  let data;
  try {
    data = new SVGLoader().parse(text);
  } catch {
    throw new UserError("svg_parse", "This file couldn't be read as an SVG. Check that it's a valid SVG image.");
  }
  const div = DIVISIONS[detail];
  const layers = new Map<string, Layer>();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const grow = (p: Poly) => {
    for (const [x, y] of p) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  };
  const layerBoxes = new Map<string, [number, number, number, number]>();

  for (const path of data.paths) {
    const style = (path.userData?.style ?? {}) as Record<string, string | number>;
    const fill = style.fill === undefined ? "#000000" : hex(String(style.fill));
    const fillOpacity = Number(style.fillOpacity ?? 1) * Number(style.opacity ?? 1);
    const stroke = hex(style.stroke as string | undefined);
    const strokeWidth = Number(style.strokeWidth ?? 1);
    const rule = String(style.fillRule ?? "nonzero").toLowerCase() === "evenodd" ? "EvenOdd" : "NonZero";
    const visibleFill = fill && fillOpacity > 0.01;
    const color = visibleFill ? fill! : stroke;
    if (!color) continue;

    let layer = layers.get(color);
    if (!layer) {
      layer = { id: color, color, name: color.toUpperCase(), fills: [], strokes: [], coverage: 0, openFillPaths: 0 };
      layers.set(color, layer);
    }
    const box = layerBoxes.get(color) ?? [Infinity, Infinity, -Infinity, -Infinity];
    const polys: Poly[] = [];
    for (const sub of path.subPaths) {
      const { poly, closed } = clean(sub.getPoints(div));
      if (poly.length < 2) continue;
      grow(poly);
      for (const [x, y] of poly) {
        box[0] = Math.min(box[0], x); box[1] = Math.min(box[1], y);
        box[2] = Math.max(box[2], x); box[3] = Math.max(box[3], y);
      }
      if (visibleFill && poly.length >= 3) {
        polys.push(poly);
        if (!closed && !sub.autoClose) layer.openFillPaths++;
      }
      if (stroke && strokeWidth > 0 && style.strokeOpacity !== 0) {
        (stroke === color ? layer : ensureStrokeLayer(layers, stroke)).strokes.push({ points: poly, closed: closed || sub.autoClose, width: strokeWidth });
      }
    }
    layerBoxes.set(color, box);
    if (polys.length) layer.fills.push({ polys, rule });
  }

  if (!layers.size || !Number.isFinite(minX)) {
    throw new UserError("svg_empty", "No shapes were found in this SVG. If it contains text, convert the text to paths (outlines) in your design app first.");
  }
  const area = Math.max((maxX - minX) * (maxY - minY), 1e-9);
  for (const [id, b] of layerBoxes) {
    const l = layers.get(id)!;
    l.coverage = ((b[2] - b[0]) * (b[3] - b[1])) / area;
  }
  return { layers: [...layers.values()], bounds: { minX, minY, maxX, maxY } };
}

function ensureStrokeLayer(layers: Map<string, Layer>, color: string): Layer {
  let l = layers.get(color);
  if (!l) {
    l = { id: color, color, name: color.toUpperCase(), fills: [], strokes: [], coverage: 0, openFillPaths: 0 };
    layers.set(color, l);
  }
  return l;
}

/** Colour distance 0–100 (simple RGB Euclidean, normalised). */
export function colorDistance(a: string, b: string): number {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const d = Math.hypot(((pa >> 16) & 255) - ((pb >> 16) & 255), ((pa >> 8) & 255) - ((pb >> 8) & 255), (pa & 255) - (pb & 255));
  return (d / 441.673) * 100;
}

/**
 * Guess the background colour: the bottom-most layer, if it is filled and
 * spans (almost) the whole drawing while other layers sit on top of it.
 */
export function detectBackground(input: VectorInput): string | null {
  const first = input.layers[0];
  if (!first || input.layers.length < 2 || first.coverage < 0.97 || !first.fills.length) return null;
  return first.color;
}
