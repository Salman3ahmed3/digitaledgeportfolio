"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToolProps } from "../ToolMount";
import type { ExportFormat } from "@/content/types";
import { DropZone } from "@/components/ui/DropZone";
import { ColorField, Group, Segmented, Toggle } from "@/components/ui/fields";
import { fmtLen, useUnits } from "@/components/ui/units";
import { PreviewPanel, type PreviewHandle } from "../shared/PreviewPanel";
import { DownloadBar } from "../shared/DownloadBar";
import { ErrorNote, ToolShell } from "../shared/ToolShell";
import { extOf, loadModel, LoadError, MODEL_EXTS, type LoadedModel } from "./load";
import { geometry } from "@/lib/workers/client";
import type { MeshStats } from "@/lib/geometry/mesh";
import type { Shading } from "@/lib/three/Viewport";
import { baseName, saveBytes } from "@/lib/download";
import { FORMATS } from "@/lib/geometry/export";
import { fileType, track, triangleBucket } from "@/lib/analytics";

const ACCEPT = MODEL_EXTS.map((e) => `.${e}`).concat(".mtl").join(",");
const GAP = 10;

/** Lay several models side by side along X so they don't overlap. */
function arrange(models: LoadedModel[]) {
  let cursor = 0;
  return models.flatMap((m) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity;
    for (const p of m.parts) {
      const a = p.positions;
      for (let i = 0; i < a.length; i += 3) {
        if (a[i] < minX) minX = a[i];
        if (a[i] > maxX) maxX = a[i];
        if (a[i + 1] < minY) minY = a[i + 1];
        if (a[i + 1] > maxY) maxY = a[i + 1];
        if (a[i + 2] < minZ) minZ = a[i + 2];
      }
    }
    const dx = models.length > 1 ? cursor - minX : -(minX + maxX) / 2;
    const dy = -(minY + maxY) / 2;
    const dz = -minZ;
    cursor += maxX - minX + GAP;
    return m.parts.map((p) => {
      const out = new Float32Array(p.positions.length);
      for (let i = 0; i < out.length; i += 3) {
        out[i] = p.positions[i] + dx;
        out[i + 1] = p.positions[i + 1] + dy;
        out[i + 2] = p.positions[i + 2] + dz;
      }
      return { ...p, positions: out };
    });
  });
}

export default function ViewerTool({ slug, preset, defaultFormat }: ToolProps) {
  const focus = (preset?.focus as string | undefined) ?? "stl";
  const [models, setModels] = useState<LoadedModel[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<MeshStats | null>(null);
  const [format, setFormat] = useState<ExportFormat>(defaultFormat ?? (focus === "stl" ? "obj" : "stl"));
  const [shading, setShading] = useState<Shading>("smooth");
  const [color, setColor] = useState("#9fb7d9");
  const [bg, setBg] = useState("");
  const [axes, setAxes] = useState(false);
  const [measure, setMeasure] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const preview = useRef<PreviewHandle>(null);
  const { units } = useUnits();

  const parts = useMemo(() => arrange(models), [models]);
  const meshes = useMemo(() => parts.map((p) => ({ positions: p.positions, indices: p.indices, color: p.color })), [parts]);

  const onFiles = useCallback(async (files: File[]) => {
    setError("");
    const modelFiles = files.filter((f) => MODEL_EXTS.includes(extOf(f.name)));
    const companions = files.filter((f) => !MODEL_EXTS.includes(extOf(f.name)));
    if (!modelFiles.length) {
      setError(files.some((f) => extOf(f.name) === "mtl") ? "Drop the .obj file together with its .mtl file." : "That file type isn't supported. Try STL, OBJ, 3MF, PLY, GLB or glTF.");
      track("error", { tool: slug, error_code: "unsupported" });
      return;
    }
    setBusy(true);
    const loaded: LoadedModel[] = [];
    for (const f of modelFiles) {
      track("file_uploaded", { tool: slug, file_type: fileType(f) });
      try {
        loaded.push(await loadModel(f, companions, (p, label) => setStatus(`${label}… ${Math.round(p * 100)}%`)));
      } catch (e) {
        const code = e instanceof LoadError ? e.code : "parse_failed";
        setError(e instanceof LoadError ? e.message : `“${f.name}” couldn't be read. The file may be damaged or use an unsupported variant.`);
        track("error", { tool: slug, error_code: code });
      }
    }
    setBusy(false);
    if (loaded.length) {
      setModels(loaded);
      setMeasure(false);
      setDistance(null);
    }
  }, [slug]);

  // Topology stats off the main thread.
  useEffect(() => {
    setStats(null);
    if (!parts.length) return;
    let cancelled = false;
    setStatus("Checking mesh…");
    geometry()
      .analyzeParts(parts.map((p) => ({ positions: p.positions, indices: p.indices })))
      .then((s) => !cancelled && setStats(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [parts]);

  useEffect(() => preview.current?.viewport()?.setShading(shading), [shading]);
  useEffect(() => preview.current?.viewport()?.setModelColor(color), [color]);
  useEffect(() => preview.current?.viewport()?.setAxes(axes), [axes]);
  useEffect(() => {
    if (bg) preview.current?.viewport()?.setBackground(bg);
  }, [bg]);
  useEffect(() => {
    const v = preview.current?.viewport();
    if (!v) return;
    v.onMeasure = (d) => setDistance(d);
    v.setMeasuring(measure);
  }, [measure]);

  const size = useMemo(() => {
    if (!parts.length) return undefined;
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const p of parts) for (let i = 0; i < p.positions.length; i++) {
      const k = i % 3;
      if (p.positions[i] < min[k]) min[k] = p.positions[i];
      if (p.positions[i] > max[k]) max[k] = p.positions[i];
    }
    return [max[0] - min[0], max[1] - min[1], max[2] - min[2]] as [number, number, number];
  }, [parts]);

  const download = async (f: ExportFormat) => {
    const bytes = await geometry().exportParts(parts.map((p) => ({ name: p.name, positions: p.positions, indices: p.indices, color: p.color })), f);
    saveBytes(bytes, `${baseName(models[0]?.fileName ?? "model")}.${FORMATS[f].ext}`, FORMATS[f].mime);
    track("download", { tool: slug, format: f, triangles: triangleBucket(stats?.triangles ?? 0) });
  };

  const screenshot = async () => {
    const blob = await preview.current?.viewport()?.screenshot();
    if (blob) saveBytes(blob, `${baseName(models[0]?.fileName ?? "model")}.png`, "image/png");
  };

  const fileLabel = models.length === 1 ? models[0].fileName : `${models.length} files`;
  const focusLabel = focus.toUpperCase();

  return (
    <ToolShell
      input={
        <div className="space-y-3">
          <DropZone
            accept={ACCEPT}
            multiple
            onFiles={onFiles}
            title={`Open ${focus === "glb" ? "a GLB or glTF" : focus === "obj" ? "an OBJ" : `a${focus === "stl" ? "n" : ""} ${focusLabel}`} file`}
            hint="STL, OBJ (+MTL), 3MF, PLY, GLB, glTF · multiple files OK"
            compact={models.length > 0}
            fileLabel={fileLabel}
          />
          {error && <ErrorNote>{error}</ErrorNote>}
        </div>
      }
      preview={
        <PreviewPanel
          ref={preview}
          meshes={meshes}
          busy={busy || (parts.length > 0 && !stats)}
          status={status}
          fitKey={models.map((m) => m.id).join("|")}
          empty={<span>Your model will appear here. Nothing is uploaded — files open on your device.</span>}
          info={
            parts.length
              ? {
                  size,
                  triangles: stats?.triangles ?? parts.reduce((n, p) => n + (p.indices ? p.indices.length : p.positions.length / 3) / 3, 0),
                  watertight: stats?.watertight,
                  extra: stats
                    ? [
                        { label: "Volume", value: `${(Math.abs(stats.volume) / 1000).toFixed(2)} cm³` },
                        { label: "Surface area", value: `${(stats.area / 100).toFixed(1)} cm²` },
                        ...(distance != null ? [{ label: "Measured", value: fmtLen(distance, units, 2) }] : []),
                      ]
                    : undefined,
                }
              : undefined
          }
          toolbarExtra={
            <>
              <button type="button" aria-pressed={measure} disabled={!parts.length} onClick={() => setMeasure(!measure)} className={`rounded px-2 py-1 disabled:opacity-40 ${measure ? "bg-accent-500 text-white" : ""}`}>
                Measure
              </button>
              <button type="button" disabled={!parts.length} onClick={screenshot} className="rounded px-2 py-1 disabled:opacity-40">Screenshot</button>
            </>
          }
        />
      }
      actions={
        <div className="space-y-2">
          <p className="text-sm font-semibold">Convert to…</p>
          <DownloadBar
            formats={["stl", "obj", "3mf", "glb", "ply"]}
            format={format}
            onFormat={setFormat}
            onDownload={download}
            disabled={!parts.length || busy}
            related={["image-to-stl", "lithophane-maker", "svg-to-stl"]}
          />
          {measure && <p className="text-xs text-[var(--muted)]">Click two points on the model to measure the distance between them.</p>}
          {stats && !stats.watertight && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Not watertight: {stats.openEdges.toLocaleString()} open and {stats.badEdges.toLocaleString()} non-manifold edges. Most slicers can repair small gaps automatically.
            </p>
          )}
        </div>
      }
      controls={
        <>
          <Group title="Display">
            <Segmented label="Shading" value={shading} onChange={setShading} options={[{ value: "smooth", label: "Solid" }, { value: "flat", label: "Flat" }, { value: "wireframe", label: "Wireframe" }]} />
            <ColorField label="Model colour" value={color} onChange={setColor} />
            <ColorField label="Background" value={bg || "#eef2f7"} onChange={setBg} />
            <Toggle label="Axes (X red, Y green, Z blue)" checked={axes} onChange={setAxes} />
          </Group>
          {models.length > 0 && (
            <Group title={`Files (${models.length})`}>
              <ul className="space-y-1 text-sm">
                {models.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{m.fileName}</span>
                    <button type="button" className="text-xs text-[var(--muted)] underline" onClick={() => setModels((ms) => ms.filter((x) => x.id !== m.id))}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </Group>
          )}
        </>
      }
    />
  );
}
