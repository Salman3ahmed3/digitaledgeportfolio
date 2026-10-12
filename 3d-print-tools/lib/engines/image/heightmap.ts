import type { Mesh } from "@/lib/geometry/mesh";

export interface GridSolidOptions {
  /** Height field in mm, row-major, row 0 = top of the image (max Y). */
  z: Float32Array;
  nx: number;
  ny: number;
  /** Size of the solid in mm. */
  sizeX: number;
  sizeY: number;
}

/**
 * Closed solid from a height field: a top surface following `z`, vertical
 * side walls and a flat bottom at Z = 0 (fan-triangulated from the centre so
 * its edges match the walls exactly). Watertight by construction.
 */
export function gridSolid({ z, nx, ny, sizeX, sizeY }: GridSolidOptions): Mesh {
  const dx = sizeX / (nx - 1), dy = sizeY / (ny - 1);
  const loopLen = 2 * (nx - 1) + 2 * (ny - 1);
  const nTop = nx * ny;
  const positions = new Float32Array((nTop + loopLen + 1) * 3);
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const v = j * nx + i;
      positions[v * 3] = i * dx;
      positions[v * 3 + 1] = (ny - 1 - j) * dy;
      positions[v * 3 + 2] = z[v];
    }
  // Boundary loop, counter-clockwise seen from above: bottom row → right column → top row → left column.
  const loop: number[] = [];
  for (let i = 0; i < nx - 1; i++) loop.push((ny - 1) * nx + i);
  for (let j = ny - 1; j > 0; j--) loop.push(j * nx + nx - 1);
  for (let i = nx - 1; i > 0; i--) loop.push(i);
  for (let j = 0; j < ny - 1; j++) loop.push(j * nx);
  const bottomStart = nTop;
  loop.forEach((t, k) => {
    const b = bottomStart + k;
    positions[b * 3] = positions[t * 3];
    positions[b * 3 + 1] = positions[t * 3 + 1];
    positions[b * 3 + 2] = 0;
  });
  const center = nTop + loopLen;
  positions[center * 3] = sizeX / 2;
  positions[center * 3 + 1] = sizeY / 2;
  positions[center * 3 + 2] = 0;

  const indices = new Uint32Array(((nx - 1) * (ny - 1) * 2 + loopLen * 3) * 3);
  let o = 0;
  for (let j = 0; j < ny - 1; j++)
    for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
      // a b (upper row, larger Y) / c d — CCW from above.
      indices[o++] = c; indices[o++] = d; indices[o++] = b;
      indices[o++] = c; indices[o++] = b; indices[o++] = a;
    }
  for (let k = 0; k < loopLen; k++) {
    const pTop = loop[k], qTop = loop[(k + 1) % loopLen];
    const pBot = bottomStart + k, qBot = bottomStart + ((k + 1) % loopLen);
    indices[o++] = pBot; indices[o++] = qBot; indices[o++] = qTop;
    indices[o++] = pBot; indices[o++] = qTop; indices[o++] = pTop;
    indices[o++] = center; indices[o++] = qBot; indices[o++] = pBot;
  }
  return { positions, indices };
}

/** Nearest-neighbour/box resample of a 0–1 field to (nx, ny). */
export function resample(src: Float32Array, w: number, h: number, nx: number, ny: number): Float32Array {
  if (nx === w && ny === h) return src;
  const out = new Float32Array(nx * ny);
  const sx = w / nx, sy = h / ny;
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const x0 = Math.floor(i * sx), x1 = Math.max(x0 + 1, Math.floor((i + 1) * sx));
      const y0 = Math.floor(j * sy), y1 = Math.max(y0 + 1, Math.floor((j + 1) * sy));
      let s = 0, n = 0;
      for (let y = y0; y < Math.min(y1, h); y++)
        for (let x = x0; x < Math.min(x1, w); x++) {
          s += src[y * w + x];
          n++;
        }
      out[j * nx + i] = n ? s / n : 0;
    }
  return out;
}
