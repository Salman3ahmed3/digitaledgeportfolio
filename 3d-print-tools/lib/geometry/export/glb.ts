import type { Part } from "../mesh";

function hexToLinear(hex?: string): [number, number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? "");
  if (!m) return [0.8, 0.8, 0.8, 1];
  const n = parseInt(m[1], 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return [c[0], c[1], c[2], 1];
}

/**
 * Binary glTF 2.0. glTF is metres and Y-up, so millimetre Z-up input is
 * scaled by 0.001 and rotated (x, y, z) → (x, z, -y).
 */
export function toGlb(parts: Part[]): Uint8Array {
  const bufferViews: object[] = [];
  const accessors: object[] = [];
  const meshes: object[] = [];
  const nodes: object[] = [];
  const materials: object[] = [];
  const chunks: Uint8Array[] = [];
  let offset = 0;

  const push = (data: ArrayBufferView, target: number) => {
    const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const pad = (4 - (bytes.length % 4)) % 4;
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, target });
    chunks.push(bytes);
    if (pad) chunks.push(new Uint8Array(pad));
    offset += bytes.length + pad;
    return bufferViews.length - 1;
  };

  parts.forEach((part, i) => {
    const src = part.mesh.positions;
    const pos = new Float32Array(src.length);
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let v = 0; v < src.length; v += 3) {
      const x = src[v] * 0.001, y = src[v + 2] * 0.001, z = -src[v + 1] * 0.001;
      pos[v] = x; pos[v + 1] = y; pos[v + 2] = z;
      const xyz = [x, y, z];
      for (let k = 0; k < 3; k++) {
        if (xyz[k] < min[k]) min[k] = xyz[k];
        if (xyz[k] > max[k]) max[k] = xyz[k];
      }
    }
    const pv = push(pos, 34962);
    const iv = push(part.mesh.indices, 34963);
    accessors.push({ bufferView: pv, componentType: 5126, count: pos.length / 3, type: "VEC3", min, max });
    accessors.push({ bufferView: iv, componentType: 5125, count: part.mesh.indices.length, type: "SCALAR" });
    materials.push({ name: part.name, pbrMetallicRoughness: { baseColorFactor: hexToLinear(part.color), metallicFactor: 0, roughnessFactor: 0.7 } });
    meshes.push({ name: part.name, primitives: [{ attributes: { POSITION: accessors.length - 2 }, indices: accessors.length - 1, material: i }] });
    nodes.push({ name: part.name, mesh: i });
  });

  const json = {
    asset: { version: "2.0", generator: "in-browser exporter" },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: offset }],
  };
  let jsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const jpad = (4 - (jsonBytes.length % 4)) % 4;
  if (jpad) {
    const padded = new Uint8Array(jsonBytes.length + jpad).fill(0x20);
    padded.set(jsonBytes);
    jsonBytes = padded;
  }
  const total = 12 + 8 + jsonBytes.length + 8 + offset;
  const out = new Uint8Array(total);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x46546c67, true); // "glTF"
  dv.setUint32(4, 2, true);
  dv.setUint32(8, total, true);
  dv.setUint32(12, jsonBytes.length, true);
  dv.setUint32(16, 0x4e4f534a, true); // "JSON"
  out.set(jsonBytes, 20);
  let o = 20 + jsonBytes.length;
  dv.setUint32(o, offset, true);
  dv.setUint32(o + 4, 0x004e4942, true); // "BIN"
  o += 8;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}
