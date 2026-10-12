import Module from "manifold-3d/manifold";
import type { ManifoldToplevel, Manifold } from "manifold-3d/manifold";
import type { Mesh } from "./mesh";

export type MF = ManifoldToplevel;
let instance: Promise<MF> | null = null;
let wasmUrl: string | undefined;

/** Browser workers call this once with the public URL of manifold.wasm. Node loads it from node_modules. */
export function setManifoldWasmUrl(url: string) {
  wasmUrl = url;
}

/**
 * Lazily initialise manifold-3d. In the browser the .wasm is served from
 * /wasm/manifold.wasm (copied there by scripts/copy-wasm.mjs) — see setManifoldWasmUrl.
 */
export function getManifold(): Promise<MF> {
  if (!instance) {
    const url = wasmUrl;
    instance = Module(url ? { locateFile: () => url } : undefined).then((m) => {
      m.setup();
      return m;
    });
  }
  return instance;
}

export function toManifold(mf: MF, mesh: Mesh): Manifold {
  const m = new mf.Mesh({ numProp: 3, vertProperties: mesh.positions, triVerts: mesh.indices });
  m.merge();
  return new mf.Manifold(m);
}

export function fromManifold(m: Manifold): Mesh {
  const mesh = m.getMesh();
  const np = mesh.numProp;
  const nv = mesh.vertProperties.length / np;
  let positions: Float32Array;
  if (np === 3) positions = new Float32Array(mesh.vertProperties);
  else {
    positions = new Float32Array(nv * 3);
    for (let i = 0; i < nv; i++) {
      positions[i * 3] = mesh.vertProperties[i * np];
      positions[i * 3 + 1] = mesh.vertProperties[i * np + 1];
      positions[i * 3 + 2] = mesh.vertProperties[i * np + 2];
    }
  }
  return { positions, indices: new Uint32Array(mesh.triVerts) };
}

/**
 * Run fn with a scratch list; every Manifold/CrossSection registered via
 * `keep` is deleted afterwards so WASM memory doesn't leak between rebuilds.
 */
export function scoped<T>(fn: (keep: <U extends { delete(): void }>(x: U) => U) => T): T {
  const owned: { delete(): void }[] = [];
  const keep = <U extends { delete(): void }>(x: U) => {
    owned.push(x);
    return x;
  };
  try {
    return fn(keep);
  } finally {
    for (const o of owned) {
      try {
        o.delete();
      } catch {
        /* already freed */
      }
    }
  }
}
