/**
 * Plain indexed triangle mesh used everywhere outside three.js.
 * Units are millimetres, Z is up (build-plate convention).
 */
export interface Mesh {
  positions: Float32Array; // xyz triplets
  indices: Uint32Array; // CCW triangles seen from outside
}

export interface Part {
  name: string;
  mesh: Mesh;
  /** sRGB hex colour hint for 3MF/GLB/preview, e.g. "#ff8800". */
  color?: string;
}

export interface Bounds {
  min: [number, number, number];
  max: [number, number, number];
}

export const triangleCount = (m: Mesh) => m.indices.length / 3;

export function bounds(m: Mesh | Mesh[]): Bounds {
  const list = Array.isArray(m) ? m : [m];
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const mesh of list) {
    const p = mesh.positions;
    for (let i = 0; i < p.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        const v = p[i + k];
        if (v < min[k]) min[k] = v;
        if (v > max[k]) max[k] = v;
      }
    }
  }
  return { min, max };
}

export const size = (b: Bounds): [number, number, number] => [b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]];

/** Concatenate meshes (no welding). */
export function mergeMeshes(meshes: Mesh[]): Mesh {
  let nv = 0;
  let ni = 0;
  for (const m of meshes) {
    nv += m.positions.length;
    ni += m.indices.length;
  }
  const positions = new Float32Array(nv);
  const indices = new Uint32Array(ni);
  let vo = 0;
  let io = 0;
  for (const m of meshes) {
    positions.set(m.positions, vo);
    const base = vo / 3;
    for (let i = 0; i < m.indices.length; i++) indices[io + i] = m.indices[i] + base;
    vo += m.positions.length;
    io += m.indices.length;
  }
  return { positions, indices };
}

/** Translate in place. */
export function translate(m: Mesh, dx: number, dy: number, dz: number): Mesh {
  const p = m.positions;
  for (let i = 0; i < p.length; i += 3) {
    p[i] += dx;
    p[i + 1] += dy;
    p[i + 2] += dz;
  }
  return m;
}

/** Move so the model is centred on X/Y and sits on Z = 0. */
export function placeOnPlate(meshes: Mesh[]): void {
  const b = bounds(meshes);
  const cx = (b.min[0] + b.max[0]) / 2;
  const cy = (b.min[1] + b.max[1]) / 2;
  for (const m of meshes) translate(m, -cx, -cy, -b.min[2]);
}

/**
 * Merge vertices that share exactly the same position (after quantising to
 * `eps`). Works on indexed or "triangle soup" input (STL).
 */
export function weld(positions: Float32Array, indices?: Uint32Array, eps = 1e-5): Mesh {
  const inv = 1 / eps;
  const map = new Map<string, number>();
  const nIn = positions.length / 3;
  const remap = new Uint32Array(nIn);
  const out: number[] = [];
  for (let i = 0; i < nIn; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    const key = `${Math.round(x * inv)},${Math.round(y * inv)},${Math.round(z * inv)}`;
    let id = map.get(key);
    if (id === undefined) {
      id = out.length / 3;
      map.set(key, id);
      out.push(x, y, z);
    }
    remap[i] = id;
  }
  const src = indices ?? Uint32Array.from({ length: nIn }, (_, i) => i);
  const idx = new Uint32Array(src.length);
  for (let i = 0; i < src.length; i++) idx[i] = remap[src[i]];
  return { positions: new Float32Array(out), indices: idx };
}

export interface MeshStats {
  triangles: number;
  volume: number; // mm³ (signed sum; positive for outward-facing triangles)
  area: number; // mm²
  watertight: boolean;
  /** Edges used by only one triangle (holes). */
  openEdges: number;
  /** Edges used by more than two triangles or inconsistently oriented. */
  badEdges: number;
}

/**
 * Watertight = every directed edge appears exactly once and its reverse
 * exactly once (closed, 2-manifold, consistently oriented). Degenerate
 * triangles (repeated vertex index) are ignored.
 */
export function analyze(input: Mesh, alreadyWelded = false): MeshStats {
  const m = alreadyWelded ? input : weld(input.positions, input.indices);
  const p = m.positions;
  const idx = m.indices;
  const nV = p.length / 3;
  let volume = 0;
  let area = 0;
  const edges = new Map<number, number>();
  let tris = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t];
    const b = idx[t + 1];
    const c = idx[t + 2];
    const ax = p[a * 3], ay = p[a * 3 + 1], az = p[a * 3 + 2];
    const bx = p[b * 3], by = p[b * 3 + 1], bz = p[b * 3 + 2];
    const cx = p[c * 3], cy = p[c * 3 + 1], cz = p[c * 3 + 2];
    volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const vx = cx - ax, vy = cy - ay, vz = cz - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    area += Math.sqrt(nx * nx + ny * ny + nz * nz) / 2;
    tris++;
    if (a === b || b === c || a === c) continue;
    for (const [u, v] of [[a, b], [b, c], [c, a]]) {
      const key = u * nV + v;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }
  let openEdges = 0;
  let badEdges = 0;
  for (const [key, count] of edges) {
    const u = Math.floor(key / nV);
    const v = key - u * nV;
    const rev = edges.get(v * nV + u) ?? 0;
    if (count > 1) badEdges++;
    else if (rev === 0) openEdges++;
    else if (rev > 1) badEdges++;
  }
  return { triangles: tris, volume, area, watertight: openEdges === 0 && badEdges === 0 && tris > 0, openEdges, badEdges };
}

/** Flat (per-face) normals for a triangle. */
export function faceNormal(p: Float32Array, a: number, b: number, c: number): [number, number, number] {
  const ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2];
  const vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz) || 1;
  nx /= l; ny /= l; nz /= l;
  return [nx, ny, nz];
}
