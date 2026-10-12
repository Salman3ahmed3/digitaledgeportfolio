import type { ExportFormat } from "@/content/types";
import type { Part } from "../mesh";
import { toBinaryStl } from "./stl";
import { toObj } from "./obj";
import { toPly } from "./ply";
import { toGlb } from "./glb";
import { to3mf } from "./threemf";

export const FORMATS: Record<ExportFormat, { label: string; mime: string; ext: string }> = {
  stl: { label: "STL (binary)", mime: "model/stl", ext: "stl" },
  obj: { label: "OBJ", mime: "model/obj", ext: "obj" },
  "3mf": { label: "3MF", mime: "model/3mf", ext: "3mf" },
  glb: { label: "GLB", mime: "model/gltf-binary", ext: "glb" },
  ply: { label: "PLY", mime: "application/octet-stream", ext: "ply" },
};

/**
 * Serialise parts. STL and PLY are single-body formats, so parts are written
 * together; callers that need one solid pass an already-unioned part.
 */
export function exportParts(parts: Part[], format: ExportFormat): Uint8Array {
  switch (format) {
    case "stl":
      return toBinaryStl(parts.map((p) => p.mesh));
    case "obj":
      return new TextEncoder().encode(toObj(parts));
    case "ply":
      return toPly(parts.map((p) => p.mesh));
    case "glb":
      return toGlb(parts);
    case "3mf":
      return to3mf(parts);
  }
}
