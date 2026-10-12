import type { Mesh as ThreeMesh, Object3D, BufferGeometry, Material } from "three";
import { Vector3 } from "three";
import { geometry, Comlink } from "@/lib/workers/client";
import { parseMtlColors } from "@/lib/geometry/parse/obj";

export interface LoadedPart {
  name: string;
  positions: Float32Array; // mm, Z-up
  indices?: Uint32Array;
  color?: string;
}

export interface LoadedModel {
  id: string;
  fileName: string;
  ext: string;
  parts: LoadedPart[];
}

export const MODEL_EXTS = ["stl", "obj", "3mf", "ply", "glb", "gltf"];
export const extOf = (name: string) => (/\.([a-z0-9]+)$/i.exec(name)?.[1] ?? "").toLowerCase();

export class LoadError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

function readWithProgress(file: File, onProgress: (f: number) => void): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(new LoadError("read_failed", "The file could not be read."));
    r.readAsArrayBuffer(file);
  });
}

function colorOf(mat: Material | Material[] | undefined): string | undefined {
  const m = (Array.isArray(mat) ? mat[0] : mat) as (Material & { color?: { getHexString(): string } }) | undefined;
  return m?.color ? `#${m.color.getHexString()}` : undefined;
}

/** Bake world transforms of a three.js scene graph into plain parts. */
function collect(root: Object3D, convert: (v: Vector3) => void): LoadedPart[] {
  root.updateMatrixWorld(true);
  const parts: LoadedPart[] = [];
  const v = new Vector3();
  root.traverse((o) => {
    const m = o as ThreeMesh;
    if (!m.isMesh) return;
    const g = m.geometry as BufferGeometry;
    const src = g.getAttribute("position");
    const out = new Float32Array(src.count * 3);
    for (let i = 0; i < src.count; i++) {
      v.fromBufferAttribute(src, i).applyMatrix4(m.matrixWorld);
      convert(v);
      out[i * 3] = v.x; out[i * 3 + 1] = v.y; out[i * 3 + 2] = v.z;
    }
    const idx = g.getIndex();
    parts.push({ name: m.name || "mesh", positions: out, indices: idx ? new Uint32Array(idx.array) : undefined, color: colorOf(m.material) });
  });
  return parts;
}

export async function loadModel(
  file: File,
  companions: File[],
  onProgress: (fraction: number, label: string) => void,
): Promise<LoadedModel> {
  const ext = extOf(file.name);
  if (!MODEL_EXTS.includes(ext)) throw new LoadError("unsupported", `“.${ext}” files aren't supported. Try STL, OBJ, 3MF, PLY, GLB or glTF.`);
  const buf = await readWithProgress(file, (f) => onProgress(f * 0.5, "Reading file"));
  let parts: LoadedPart[];

  if (ext === "stl" || ext === "obj" || ext === "ply") {
    const parsed = await geometry().parseModel(
      Comlink.transfer(buf, [buf]),
      ext,
      file.name,
      Comlink.proxy((f: number, label?: string) => onProgress(0.5 + f * 0.5, label ?? "Parsing")),
    );
    let colors: Record<string, string> = {};
    if (ext === "obj") {
      const mtl = companions.find((c) => extOf(c.name) === "mtl");
      if (mtl) colors = parseMtlColors(await mtl.text());
    }
    parts = parsed.map((p) => ({ ...p, color: p.material ? colors[p.material] : undefined }));
  } else if (ext === "3mf") {
    onProgress(0.6, "Parsing 3MF");
    const { ThreeMFLoader } = await import("three/examples/jsm/loaders/3MFLoader.js");
    const group = new ThreeMFLoader().parse(buf);
    parts = collect(group, () => {});
  } else {
    onProgress(0.6, "Parsing glTF");
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
    const gltf = await new GLTFLoader().parseAsync(ext === "gltf" ? new TextDecoder().decode(buf) : buf, "");
    // glTF: metres, Y-up → millimetres, Z-up.
    parts = collect(gltf.scene, (v) => v.set(v.x * 1000, -v.z * 1000, v.y * 1000));
  }
  parts = parts.filter((p) => p.positions.length >= 9);
  if (!parts.length) throw new LoadError("empty", "No triangles were found in this file.");
  onProgress(1, "Done");
  return { id: `${file.name}-${file.size}-${Date.now()}`, fileName: file.name, ext, parts };
}
