import { mergeMeshes, type Mesh } from "../mesh";

/** Binary little-endian PLY. */
export function toPly(meshes: Mesh[]): Uint8Array {
  const m = mergeMeshes(meshes);
  const nv = m.positions.length / 3;
  const nf = m.indices.length / 3;
  const header = new TextEncoder().encode(
    [
      "ply",
      "format binary_little_endian 1.0",
      "comment units: millimetres",
      `element vertex ${nv}`,
      "property float x",
      "property float y",
      "property float z",
      `element face ${nf}`,
      "property list uchar int vertex_indices",
      "end_header",
      "",
    ].join("\n"),
  );
  const buf = new ArrayBuffer(header.length + nv * 12 + nf * 13);
  const u8 = new Uint8Array(buf);
  const dv = new DataView(buf);
  u8.set(header, 0);
  let o = header.length;
  for (let i = 0; i < m.positions.length; i++, o += 4) dv.setFloat32(o, m.positions[i], true);
  for (let t = 0; t < m.indices.length; t += 3) {
    dv.setUint8(o, 3);
    dv.setInt32(o + 1, m.indices[t], true);
    dv.setInt32(o + 5, m.indices[t + 1], true);
    dv.setInt32(o + 9, m.indices[t + 2], true);
    o += 13;
  }
  return u8;
}
