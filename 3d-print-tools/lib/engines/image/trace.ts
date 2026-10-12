import type { Poly } from "../types";

/**
 * Trace the boundary of a binary mask into closed polygons (pixel-corner
 * coordinates, Y down). Outer boundaries and holes come out as separate
 * loops; fill them with the even-odd rule.
 */
export function traceMask(mask: Uint8Array, w: number, h: number): Poly[] {
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && mask[y * w + x] === 1;
  const W = w + 1;
  // Directed boundary edges keyed by start corner; foreground kept on the left
  // (in Y-down image space). Up to 2 outgoing edges per corner (diagonal pixels).
  const next = new Map<number, number[]>();
  const add = (x0: number, y0: number, x1: number, y1: number) => {
    const k = y0 * W + x0;
    const v = y1 * W + x1;
    const list = next.get(k);
    if (list) list.push(v);
    else next.set(k, [v]);
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!at(x, y)) continue;
      if (!at(x, y - 1)) add(x + 1, y, x, y); // top edge, right → left
      if (!at(x - 1, y)) add(x, y, x, y + 1); // left edge, top → bottom
      if (!at(x, y + 1)) add(x, y + 1, x + 1, y + 1); // bottom edge, left → right
      if (!at(x + 1, y)) add(x + 1, y + 1, x + 1, y); // right edge, bottom → top
    }
  const polys: Poly[] = [];
  for (const [start, outs] of next) {
    while (outs.length) {
      const loop: number[] = [start];
      let prev = start;
      let cur = outs.pop()!;
      let guard = 0;
      while (cur !== start && guard++ < 10_000_000) {
        loop.push(cur);
        const cand = next.get(cur);
        if (!cand || !cand.length) break;
        let pick = 0;
        if (cand.length > 1) {
          // Ambiguous corner: take the sharpest left turn so touching pixels stay separate.
          const px = prev % W, py = (prev - px) / W, cx = cur % W, cy = (cur - cx) / W;
          const dIn = [cx - px, cy - py];
          let best = -Infinity;
          cand.forEach((n, i) => {
            const nx = n % W, ny = (n - nx) / W;
            const dOut = [nx - cx, ny - cy];
            const cross = dIn[0] * dOut[1] - dIn[1] * dOut[0];
            if (cross > best) {
              best = cross;
              pick = i;
            }
          });
        }
        prev = cur;
        cur = cand.splice(pick, 1)[0];
      }
      if (loop.length >= 4) polys.push(dropCollinear(loop.map((k) => [k % W, Math.floor(k / W)] as [number, number])));
    }
  }
  return polys.filter((p) => p.length >= 3);
}

function dropCollinear(p: Poly): Poly {
  const out: Poly = [];
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n];
    if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) out.push(b);
  }
  return out;
}

export const area = (p: Poly) => {
  let a = 0;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]);
  return a / 2;
};

/** Chaikin corner cutting (closed polygon). */
export function chaikin(p: Poly, iterations: number): Poly {
  let cur = p;
  for (let it = 0; it < iterations; it++) {
    const out: Poly = [];
    for (let i = 0; i < cur.length; i++) {
      const a = cur[i], b = cur[(i + 1) % cur.length];
      out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    cur = out;
  }
  return cur;
}

/** Douglas–Peucker simplification for a closed polygon. */
export function simplify(p: Poly, eps: number): Poly {
  if (eps <= 0 || p.length < 5) return p;
  const rdp = (pts: Poly): Poly => {
    if (pts.length < 3) return pts;
    const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
    const len = Math.hypot(bx - ax, by - ay) || 1e-12;
    let maxD = -1, idx = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len;
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD <= eps) return [pts[0], pts[pts.length - 1]];
    return [...rdp(pts.slice(0, idx + 1)).slice(0, -1), ...rdp(pts.slice(idx))];
  };
  // Split at the point farthest from the first one so both halves are open chains.
  let far = 0, fd = -1;
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[0][0], p[i][1] - p[0][1]);
    if (d > fd) {
      fd = d;
      far = i;
    }
  }
  const a = rdp(p.slice(0, far + 1));
  const b = rdp([...p.slice(far), p[0]]);
  const out = [...a.slice(0, -1), ...b.slice(0, -1)];
  return out.length >= 3 ? out : p;
}

/** Remove isolated specks/holes smaller than `minArea` px² and smooth outlines. */
export function cleanContours(polys: Poly[], opts: { minArea: number; smooth: number; simplify: number }): Poly[] {
  return polys
    .filter((p) => Math.abs(area(p)) >= opts.minArea)
    .map((p) => simplify(chaikin(p, opts.smooth), opts.simplify))
    .filter((p) => p.length >= 3);
}
