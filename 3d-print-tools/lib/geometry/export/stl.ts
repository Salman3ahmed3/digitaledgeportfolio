import { faceNormal, type Mesh } from "../mesh";

/** Binary STL. One solid; multiple meshes are written back to back. */
export function toBinaryStl(meshes: Mesh[], header = "Exported in-browser"): Uint8Array {
  const tris = meshes.reduce((n, m) => n + m.indices.length / 3, 0);
  const buf = new ArrayBuffer(84 + tris * 50);
  const u8 = new Uint8Array(buf);
  const dv = new DataView(buf);
  const h = new TextEncoder().encode(header.slice(0, 79));
  u8.set(h, 0);
  dv.setUint32(80, tris, true);
  let o = 84;
  for (const m of meshes) {
    const p = m.positions;
    const idx = m.indices;
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t], b = idx[t + 1], c = idx[t + 2];
      const n = faceNormal(p, a, b, c);
      dv.setFloat32(o, n[0], true); dv.setFloat32(o + 4, n[1], true); dv.setFloat32(o + 8, n[2], true);
      o += 12;
      for (const v of [a, b, c]) {
        dv.setFloat32(o, p[v * 3], true);
        dv.setFloat32(o + 4, p[v * 3 + 1], true);
        dv.setFloat32(o + 8, p[v * 3 + 2], true);
        o += 12;
      }
      dv.setUint16(o, 0, true);
      o += 2;
    }
  }
  return u8;
}

export function toAsciiStl(meshes: Mesh[], name = "model"): string {
  const out: string[] = [`solid ${name}`];
  for (const m of meshes) {
    const p = m.positions;
    for (let t = 0; t < m.indices.length; t += 3) {
      const a = m.indices[t], b = m.indices[t + 1], c = m.indices[t + 2];
      const n = faceNormal(p, a, b, c);
      out.push(` facet normal ${n[0]} ${n[1]} ${n[2]}`, "  outer loop");
      for (const v of [a, b, c]) out.push(`   vertex ${p[v * 3]} ${p[v * 3 + 1]} ${p[v * 3 + 2]}`);
      out.push("  endloop", " endfacet");
    }
  }
  out.push(`endsolid ${name}`);
  return out.join("\n");
}
