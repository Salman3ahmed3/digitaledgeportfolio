import { parse as parseFont, type Font, type PathCommand } from "opentype.js";
import type { Layer, Poly, VectorInput } from "./types";
import { UserError } from "./types";

export const FONTS = {
  inter: { label: "Inter Bold (sans)", file: "/fonts/inter-bold.ttf" },
  bebas: { label: "Bebas Neue (condensed)", file: "/fonts/bebas-neue.ttf" },
  pacifico: { label: "Pacifico (script)", file: "/fonts/pacifico.ttf" },
} as const;
export type FontKey = keyof typeof FONTS;

const cache = new Map<string, Promise<Font>>();

/** Load a bundled font. `load` lets tests read from disk instead of fetch. */
export function loadFont(key: FontKey, load: (path: string) => Promise<ArrayBuffer> = (p) => fetch(p).then((r) => r.arrayBuffer())): Promise<Font> {
  let f = cache.get(key);
  if (!f) {
    f = load(FONTS[key].file).then((buf) => parseFont(buf));
    cache.set(key, f);
  }
  return f;
}

function flatten(cmds: PathCommand[], steps = 8): Poly[] {
  const polys: Poly[] = [];
  let cur: Poly = [];
  let x = 0, y = 0;
  for (const c of cmds) {
    if (c.type === "M") {
      if (cur.length > 2) polys.push(cur);
      cur = [[c.x!, c.y!]];
      x = c.x!; y = c.y!;
    } else if (c.type === "L") {
      cur.push([c.x!, c.y!]);
      x = c.x!; y = c.y!;
    } else if (c.type === "Q") {
      for (let i = 1; i <= steps; i++) {
        const t = i / steps, u = 1 - t;
        cur.push([u * u * x + 2 * u * t * c.x1! + t * t * c.x!, u * u * y + 2 * u * t * c.y1! + t * t * c.y!]);
      }
      x = c.x!; y = c.y!;
    } else if (c.type === "C") {
      for (let i = 1; i <= steps; i++) {
        const t = i / steps, u = 1 - t;
        cur.push([
          u * u * u * x + 3 * u * u * t * c.x1! + 3 * u * t * t * c.x2! + t * t * t * c.x!,
          u * u * u * y + 3 * u * u * t * c.y1! + 3 * u * t * t * c.y2! + t * t * t * c.y!,
        ]);
      }
      x = c.x!; y = c.y!;
    } else if (c.type === "Z") {
      if (cur.length > 2) polys.push(cur);
      cur = [];
    }
  }
  if (cur.length > 2) polys.push(cur);
  // drop duplicated closing point
  for (const p of polys) {
    const a = p[0], b = p[p.length - 1];
    if (p.length > 3 && Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9) p.pop();
  }
  return polys;
}

/**
 * Lay out (multi-line, centred) text as polygons in font units with Y down,
 * as a VectorInput like a parsed SVG.
 */
export function textToVector(font: Font, text: string, opts: { letterSpacing?: number; lineHeight?: number } = {}): VectorInput {
  const lines = text.split(/\r?\n/).map((l) => l.trimEnd());
  if (!lines.some((l) => l.trim())) throw new UserError("text_empty", "Type some text to generate a model.");
  const size = 100;
  const lh = size * (opts.lineHeight ?? 1.15);
  // Glyph-by-glyph layout with kerning. Avoids opentype.js shaping, which
  // doesn't support every substitution table in the bundled fonts.
  const k = size / font.unitsPerEm;
  const spacing = (opts.letterSpacing ?? 0) * size;
  const layout = (line: string) => {
    const glyphs = Array.from(line).map((ch) => font.charToGlyph(ch));
    const xs: number[] = [];
    let x = 0;
    glyphs.forEach((g, i) => {
      if (i > 0) x += font.getKerningValue(glyphs[i - 1], g) * k;
      xs.push(x);
      x += (g.advanceWidth ?? 0) * k + spacing;
    });
    return { glyphs, xs, width: Math.max(0, x - spacing) };
  };
  const laid = lines.map(layout);
  const maxW = Math.max(...laid.map((l) => l.width));
  const polys: Poly[] = [];
  laid.forEach((l, i) => {
    const x0 = (maxW - l.width) / 2;
    l.glyphs.forEach((g, j) => polys.push(...flatten(g.getPath(x0 + l.xs[j], i * lh, size).commands)));
  });
  if (!polys.length) throw new UserError("text_glyphs", "This font has no shapes for those characters. Try another font.");
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of polys) for (const [x, y] of p) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const layer: Layer = { id: "text", color: "#2b7fff", name: "Text", fills: [{ polys, rule: "NonZero" }], strokes: [], coverage: 1, openFillPaths: 0 };
  return { layers: [layer], bounds: { minX, minY, maxX, maxY } };
}
