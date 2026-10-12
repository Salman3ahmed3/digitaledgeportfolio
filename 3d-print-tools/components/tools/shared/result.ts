import type { BuildResult } from "@/lib/engines/types";
import type { ViewMesh } from "@/lib/three/Viewport";
import type { PreviewInfo } from "./PreviewPanel";
import type { ExportFormat } from "@/content/types";
import { geometry } from "@/lib/workers/client";
import { FORMATS } from "@/lib/geometry/export";
import { saveBytes } from "@/lib/download";
import { track, triangleBucket } from "@/lib/analytics";

export const toViewMeshes = (r: BuildResult | null, colored = true): ViewMesh[] =>
  r ? r.parts.map((p) => ({ positions: p.positions, indices: p.indices, color: colored ? p.color : undefined })) : [];

export const toInfo = (r: BuildResult | null, extra: PreviewInfo["extra"] = []): PreviewInfo | undefined =>
  r ? { size: r.size, triangles: r.triangles, watertight: r.watertight, extra: [{ label: "Volume", value: `${(r.volume / 1000).toFixed(2)} cm³` }, ...extra] } : undefined;

/** Export the current build (copying buffers, so the preview keeps its data). */
export async function downloadBuilt(tool: string, r: BuildResult, format: ExportFormat, name: string) {
  const bytes = await geometry().exportBuilt(
    r.parts.map((p) => ({ name: p.name, color: p.color, positions: p.positions, indices: p.indices })),
    format,
  );
  saveBytes(bytes, `${name}.${FORMATS[format].ext}`, FORMATS[format].mime);
  track("download", { tool, format, triangles: triangleBucket(r.triangles) });
}
