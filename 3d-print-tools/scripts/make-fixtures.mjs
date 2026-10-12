// Generates the test fixtures in tests/fixtures. Output is committed; re-run
// only if you change this script: `npm run fixtures`.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";
import { zipSync, strToU8 } from "fflate";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../tests/fixtures");
mkdirSync(dir, { recursive: true });
const out = (name, data) => writeFileSync(join(dir, name), data);

// ---------- raster images ----------
function png(w, h, fn) {
  const img = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, g, b, a = 255] = fn(x, y);
      const i = (y * w + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = a;
    }
  return PNG.sync.write(img);
}

// Simple logo: dark ring + dark bar on white (has a hole, like the letter "O").
out("logo.png", png(200, 120, (x, y) => {
  const d = Math.hypot(x - 60, y - 60);
  const ring = d < 45 && d > 25;
  const bar = x > 120 && x < 180 && y > 40 && y < 80;
  return ring || bar ? [20, 20, 30] : [255, 255, 255];
}));

// "Photo": smooth gradients + a bright disc, written as JPEG.
{
  const w = 240, h = 180;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const sky = 90 + (y / h) * 120;
      const sun = Math.max(0, 255 - Math.hypot(x - 170, y - 50) * 4);
      const v = Math.min(255, sky + sun);
      data[i] = v; data[i + 1] = v * 0.9; data[i + 2] = v * 0.8; data[i + 3] = 255;
    }
  out("photo.jpg", jpeg.encode({ data, width: w, height: h }, 85).data);
}

// ---------- SVGs ----------
out("multicolor.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="120" height="80">
  <rect x="0" y="0" width="120" height="80" fill="#ffffff"/>
  <path d="M10 10 H50 V50 H10 Z M20 20 V40 H40 V20 Z" fill="#e11d48" fill-rule="evenodd"/>
  <circle cx="85" cy="30" r="20" fill="#2563eb"/>
  <g transform="translate(60 55)"><rect x="0" y="0" width="50" height="15" rx="4" fill="#16a34a"/></g>
</svg>`);
out("stroke-only.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <path d="M10 90 L50 10 L90 90" fill="none" stroke="#000" stroke-width="4"/>
  <polyline points="20,60 80,60" fill="none" stroke="#000" stroke-width="3"/>
</svg>`);
out("letters.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">
  <path fill="#000" fill-rule="evenodd" d="M25 5 A20 20 0 1 0 25.01 5 Z M25 15 A10 10 0 1 1 24.99 15 Z"/>
  <path fill="#000" d="M55 45 L70 5 L85 45 L77 45 L74 36 L66 36 L63 45 Z M68 29 L72 29 L70 22 Z"/>
</svg>`);

// ---------- meshes: a 20 mm cube ----------
const V = [[0,0,0],[20,0,0],[20,20,0],[0,20,0],[0,0,20],[20,0,20],[20,20,20],[0,20,20]];
const F = [[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]];
function normal(a, b, c) {
  const u = b.map((v, i) => v - a[i]), w = c.map((v, i) => v - a[i]);
  const n = [u[1]*w[2]-u[2]*w[1], u[2]*w[0]-u[0]*w[2], u[0]*w[1]-u[1]*w[0]];
  const l = Math.hypot(...n) || 1;
  return n.map((x) => x / l);
}
{
  const buf = Buffer.alloc(84 + F.length * 50);
  buf.write("fixture cube", 0);
  buf.writeUInt32LE(F.length, 80);
  let o = 84;
  for (const f of F) {
    for (const x of normal(V[f[0]], V[f[1]], V[f[2]])) { buf.writeFloatLE(x, o); o += 4; }
    for (const vi of f) for (const x of V[vi]) { buf.writeFloatLE(x, o); o += 4; }
    o += 2;
  }
  out("cube-binary.stl", buf);
}
out("cube-ascii.stl", ["solid cube", ...F.flatMap((f) => [
  ` facet normal ${normal(V[f[0]], V[f[1]], V[f[2]]).join(" ")}`, "  outer loop",
  ...f.map((vi) => `   vertex ${V[vi].join(" ")}`), "  endloop", " endfacet"]), "endsolid cube"].join("\n"));
out("cube.obj", ["mtllib cube.mtl", "o cube", ...V.map((v) => `v ${v.join(" ")}`), "usemtl orange", ...F.map((f) => `f ${f.map((i) => i + 1).join(" ")}`)].join("\n"));
out("cube.mtl", "newmtl orange\nKd 0.95 0.45 0.1\n");
{
  const header = `ply\nformat ascii 1.0\nelement vertex 8\nproperty float x\nproperty float y\nproperty float z\nelement face 12\nproperty list uchar int vertex_indices\nend_header\n`;
  out("cube.ply", header + V.map((v) => v.join(" ")).join("\n") + "\n" + F.map((f) => `3 ${f.join(" ")}`).join("\n") + "\n");
}
{
  const verts = V.map(([x, y, z]) => `<vertex x="${x}" y="${y}" z="${z}"/>`).join("");
  const tris = F.map(([a, b, c]) => `<triangle v1="${a}" v2="${b}" v3="${c}"/>`).join("");
  const model = `<?xml version="1.0" encoding="UTF-8"?><model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources><object id="1" type="model"><mesh><vertices>${verts}</vertices><triangles>${tris}</triangles></mesh></object></resources><build><item objectid="1"/></build></model>`;
  out("cube.3mf", zipSync({
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>`),
    "3D/3dmodel.model": strToU8(model),
  }));
}
{
  // GLB: same cube in metres, Y-up.
  const pos = new Float32Array(V.flatMap(([x, y, z]) => [x / 1000, z / 1000, -y / 1000]));
  const idx = new Uint16Array(F.flat());
  const bin = Buffer.concat([Buffer.from(pos.buffer), Buffer.from(idx.buffer)]);
  const min = [0, 0, -0.02], max = [0.02, 0.02, 0];
  const json = JSON.stringify({
    asset: { version: "2.0" }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 8, type: "VEC3", min, max },
      { bufferView: 1, componentType: 5123, count: 36, type: "SCALAR" },
    ],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: pos.byteLength }, { buffer: 0, byteOffset: pos.byteLength, byteLength: idx.byteLength }],
    buffers: [{ byteLength: bin.length }],
  });
  const jb = Buffer.from(json.padEnd(Math.ceil(json.length / 4) * 4, " "));
  const bb = Buffer.concat([bin, Buffer.alloc((4 - (bin.length % 4)) % 4)]);
  const h = Buffer.alloc(12); h.writeUInt32LE(0x46546c67, 0); h.writeUInt32LE(2, 4); h.writeUInt32LE(12 + 8 + jb.length + 8 + bb.length, 8);
  const c1 = Buffer.alloc(8); c1.writeUInt32LE(jb.length, 0); c1.writeUInt32LE(0x4e4f534a, 4);
  const c2 = Buffer.alloc(8); c2.writeUInt32LE(bb.length, 0); c2.writeUInt32LE(0x004e4942, 4);
  out("cube.glb", Buffer.concat([h, c1, jb, c2, bb]));
}
console.log("fixtures written to", dir);
