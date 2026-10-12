import * as Comlink from "comlink";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import type { BufferGeometry, Mesh as ThreeMesh } from "three";
import type { ExportFormat } from "@/content/types";
import { analyze, weld, type MeshStats, type Part } from "@/lib/geometry/mesh";
import { exportParts } from "@/lib/geometry/export";
import { parseStl } from "@/lib/geometry/parse/stl";
import { getManifold } from "@/lib/geometry/manifold";
import { buildVector, unionParts, type VectorBuildInput } from "@/lib/engines/svg/build";
import { loadFont, textToVector, type FontKey } from "@/lib/engines/text";
import { buildImage } from "@/lib/engines/image/build";
import type { ImageSettings } from "@/lib/engines/image/settings";
import type { Rgba } from "@/lib/engines/image/pixels";
import { buildLithophane, type LithoResult } from "@/lib/engines/lithophane/build";
import type { LithoSettings } from "@/lib/engines/lithophane/settings";
import { UserError, type BuildResult } from "@/lib/engines/types";

export interface ParsedPart {
  name: string;
  positions: Float32Array;
  indices?: Uint32Array;
  material?: string;
}

type Progress = (fraction: number, label?: string) => void;

function transferables(parts: { positions: Float32Array; indices?: Uint32Array }[]) {
  const t: ArrayBuffer[] = [];
  for (const p of parts) {
    t.push(p.positions.buffer as ArrayBuffer);
    if (p.indices) t.push(p.indices.buffer as ArrayBuffer);
  }
  return t;
}

function fromGeometry(g: BufferGeometry, name: string, material?: string): ParsedPart {
  const pos = g.getAttribute("position").array as Float32Array;
  const idx = g.getIndex()?.array;
  return {
    name,
    positions: new Float32Array(pos),
    indices: idx ? new Uint32Array(idx) : undefined,
    material,
  };
}

export const api = {
  ping: () => "pong",

  /** Smoke test for WASM loading inside the worker. */
  async manifoldCheck() {
    const mf = await getManifold();
    const c = mf.Manifold.cube([2, 2, 2]);
    const v = c.volume();
    c.delete();
    return v;
  },

  /** Parse STL, OBJ or PLY off the main thread. */
  async parseModel(buffer: ArrayBuffer, ext: "stl" | "obj" | "ply", name: string, onProgress?: Progress): Promise<ParsedPart[]> {
    let parts: ParsedPart[] = [];
    if (ext === "stl") {
      const positions = parseStl(buffer, (f) => onProgress?.(f, "Reading STL"));
      parts = [{ name, positions }];
    } else if (ext === "ply") {
      onProgress?.(0.2, "Reading PLY");
      const g = new PLYLoader().parse(buffer);
      parts = [fromGeometry(g, name)];
    } else {
      onProgress?.(0.2, "Reading OBJ");
      const group = new OBJLoader().parse(new TextDecoder().decode(buffer));
      group.traverse((o) => {
        const m = o as ThreeMesh;
        if (!m.isMesh) return;
        const g = m.geometry as BufferGeometry;
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        if (g.groups.length > 1 && mats.length > 1) {
          // Split multi-material meshes so each part can carry its MTL colour.
          const pos = g.getAttribute("position").array as Float32Array;
          for (const grp of g.groups) {
            parts.push({
              name: `${m.name || name}-${mats[grp.materialIndex ?? 0]?.name ?? grp.materialIndex}`,
              positions: pos.slice(grp.start * 3, (grp.start + grp.count) * 3),
              material: mats[grp.materialIndex ?? 0]?.name,
            });
          }
        } else parts.push(fromGeometry(g, m.name || name, mats[0]?.name));
      });
    }
    onProgress?.(1);
    return Comlink.transfer(parts, transferables(parts));
  },

  /** Weld + topology/volume stats for a set of parts. */
  analyzeParts(parts: { positions: Float32Array; indices?: Uint32Array }[]): MeshStats {
    let total: MeshStats = { triangles: 0, volume: 0, area: 0, watertight: true, openEdges: 0, badEdges: 0 };
    for (const p of parts) {
      const s = analyze(weld(p.positions, p.indices), true);
      total = {
        triangles: total.triangles + s.triangles,
        volume: total.volume + s.volume,
        area: total.area + s.area,
        watertight: total.watertight && s.watertight,
        openEdges: total.openEdges + s.openEdges,
        badEdges: total.badEdges + s.badEdges,
      };
    }
    return total;
  },

  /** SVG / text → solids. UserErrors are re-thrown with a code prefix so the UI can show them. */
  async buildVector(b: VectorBuildInput): Promise<BuildResult> {
    return wrap(async () => finish(buildVector(await getManifold(), b)));
  },

  /** Image → heightmap relief or traced logo. */
  async buildImage(img: Rgba, settings: ImageSettings): Promise<BuildResult> {
    return wrap(async () => finish(buildImage(settings.mode === "extrude" ? await getManifold() : (null as never), img, settings)));
  },

  /** Cropped image → lithophane. Thickness arrays drive the backlit preview. */
  async buildLithophane(img: Rgba, settings: LithoSettings): Promise<LithoResult> {
    return wrap(async () => {
      const font = settings.text.trim() ? await loadFont(settings.textFont) : undefined;
      const r = buildLithophane(await getManifold(), img, settings, font);
      return Comlink.transfer(r, [...transferables(r.parts), ...r.thickness.map((t) => t.buffer as ArrayBuffer)]);
    });
  },

  /** Text → glyph outlines → solids, in one cancellable job. */
  async buildText(t: { text: string; font: FontKey; letterSpacing: number }, b: Omit<VectorBuildInput, "input">): Promise<BuildResult> {
    return wrap(async () => {
      const input = textToVector(await loadFont(t.font), t.text, { letterSpacing: t.letterSpacing });
      return finish(buildVector(await getManifold(), { ...b, input }));
    });
  },

  /** Export generated parts. STL/PLY get a single boolean-unioned body. */
  async exportBuilt(parts: { name: string; color?: string; positions: Float32Array; indices: Uint32Array }[], format: ExportFormat): Promise<Uint8Array> {
    let ps: Part[] = parts.map((p) => ({ name: p.name, color: p.color, mesh: { positions: p.positions, indices: p.indices } }));
    if ((format === "stl" || format === "ply") && ps.length > 1) {
      ps = [{ name: "model", mesh: unionParts(await getManifold(), ps.map((p) => p.mesh)) }];
    }
    const out = exportParts(ps, format);
    return Comlink.transfer(out, [out.buffer as ArrayBuffer]);
  },

  /** Weld triangle soup (e.g. STL) into an indexed mesh before exporting. */
  exportParts(parts: { name: string; positions: Float32Array; indices?: Uint32Array; color?: string }[], format: ExportFormat): Uint8Array {
    const ps: Part[] = parts.map((p) => ({
      name: p.name,
      color: p.color,
      mesh: p.indices ? { positions: p.positions, indices: p.indices } : weld(p.positions),
    }));
    const out = exportParts(ps, format);
    return Comlink.transfer(out, [out.buffer as ArrayBuffer]);
  },
};

export type GeometryApi = typeof api;

/** Comlink loses Error subclasses; encode UserError as "USER:<code>:<message>". */
async function wrap<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof UserError) throw new Error(`USER:${e.code}:${e.message}`);
    throw e;
  }
}

function finish(r: BuildResult): BuildResult {
  return Comlink.transfer(r, transferables(r.parts));
}
