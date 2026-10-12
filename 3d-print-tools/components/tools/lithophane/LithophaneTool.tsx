"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToolProps } from "../ToolMount";
import type { ExportFormat } from "@/content/types";
import { DropZone } from "@/components/ui/DropZone";
import { Group, NumberField, Segmented, SelectField, TextField, Toggle } from "@/components/ui/fields";
import { PreviewPanel, type PreviewHandle } from "../shared/PreviewPanel";
import { DownloadBar } from "../shared/DownloadBar";
import { ErrorNote, ToolShell } from "../shared/ToolShell";
import { useBuild } from "../shared/useBuild";
import { downloadBuilt } from "../shared/result";
import { openBitmap, rasterize, RASTER_ACCEPT } from "../shared/decode";
import { CropPreview } from "./CropPreview";
import { useSettings } from "@/lib/useSettings";
import { FILAMENT_DIAMETER, LITHO_DEFAULTS, PLA_DENSITY, EST_FLOW_MM3_S, type Aspect, type LithoSettings, type LithoShape } from "@/lib/engines/lithophane/settings";
import { cropRect, targetAspect } from "@/lib/engines/lithophane/adjust";
import type { Rgba } from "@/lib/engines/image/pixels";
import type { LithoResult } from "@/lib/engines/lithophane/build";
import type { ViewMesh } from "@/lib/three/Viewport";
import { FONTS, type FontKey } from "@/lib/engines/text";
import { baseName } from "@/lib/download";
import { fileType, track } from "@/lib/analytics";

type PreviewMode = "printed" | "backlit" | "heightmap";

const SHAPES: { value: LithoShape; label: string }[] = [
  { value: "flat", label: "Flat panel" },
  { value: "arc", label: "Curved (arc)" },
  { value: "cylinder", label: "Cylinder / night light" },
  { value: "heart", label: "Heart" },
  { value: "circle", label: "Circle" },
];

/** Per-vertex colours from wall thickness. */
function shade(thickness: Float32Array, mode: PreviewMode, min: number, max: number): Float32Array {
  const out = new Float32Array(thickness.length * 3);
  const range = Math.max(max - min, 0.01);
  const k = Math.log(25) / range;
  for (let i = 0; i < thickness.length; i++) {
    const t = thickness[i];
    if (mode === "backlit") {
      // Transmitted light ∝ exp(−k·thickness), normalised so the thinnest wall is brightest.
      const I = 0.04 + 0.96 * Math.exp(-k * Math.max(0, t - min));
      out[i * 3] = 1.0 * I;
      out[i * 3 + 1] = 0.86 * I;
      out[i * 3 + 2] = 0.62 * I;
    } else {
      const v = Math.min(1, Math.max(0, (t - min) / range));
      out[i * 3] = 0.15 + 0.85 * v;
      out[i * 3 + 1] = 0.35 + 0.5 * Math.sin(v * Math.PI);
      out[i * 3 + 2] = 0.95 - 0.8 * v;
    }
  }
  return out;
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
}

export default function LithophaneTool({ slug, preset, defaultFormat }: ToolProps) {
  const { settings: s, update, setSettings, reset } = useSettings<LithoSettings>(`pb:${slug}`, LITHO_DEFAULTS, preset as Partial<LithoSettings>);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const [inputError, setInputError] = useState("");
  const [format, setFormat] = useState<ExportFormat>(defaultFormat ?? "stl");
  const [mode, setMode] = useState<PreviewMode>("printed");
  const preview = useRef<PreviewHandle>(null);

  // A dark room makes the backlit simulation easier to judge.
  useEffect(() => {
    const v = preview.current?.viewport();
    if (!v) return;
    if (mode === "backlit") v.setBackground("#111318");
    else v.setDark(document.documentElement.classList.contains("dark"));
  }, [mode]);

  const set = <K extends keyof LithoSettings>(k: K, v: LithoSettings[K]) => {
    update(k, v);
    track("settings_changed", { tool: slug });
  };

  const onFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setInputError("");
    track("file_uploaded", { tool: slug, file_type: fileType(f) });
    try {
      const bmp = await openBitmap(f);
      setBitmap(bmp);
      setFileName(f.name);
      setFileKey((k) => k + 1);
      setSettings((cur) => ({ ...cur, zoom: 1, panX: 0, panY: 0 }));
    } catch (e) {
      setInputError((e as Error).message);
      track("error", { tool: slug, error_code: "decode_failed" });
    }
  }, [slug, setSettings]);

  const aspect = bitmap ? targetAspect(s, bitmap.width, bitmap.height) : 1;
  const img = useMemo<Rgba | null>(() => {
    if (!bitmap) return null;
    const crop = cropRect(bitmap.width, bitmap.height, aspect, s.zoom, s.panX, s.panY);
    // Supersample 2× the mesh resolution so the resample step averages pixels.
    return rasterize(bitmap, Math.min(1200, s.resolution * 2), crop);
  }, [bitmap, aspect, s.zoom, s.panX, s.panY, s.resolution]);

  const { result, busy, error } = useBuild<LithoResult>(slug, img ? (api) => api.buildLithophane(img, s) : null, [img, s]);

  const meshes = useMemo<ViewMesh[]>(() => {
    if (!result) return [];
    return result.parts.map((p, i) => ({
      positions: p.positions,
      indices: p.indices,
      color: p.color,
      colors: mode === "printed" ? undefined : shade(result.thickness[i], mode, s.minThickness, s.maxThickness),
      unlit: mode === "backlit",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, mode]);

  const est = result
    ? {
        cm3: result.volume / 1000,
        grams: (result.volume / 1000) * PLA_DENSITY,
        metres: result.volume / (Math.PI * (FILAMENT_DIAMETER / 2) ** 2) / 1000,
        seconds: result.volume / EST_FLOW_MM3_S,
      }
    : null;

  const isFlat = s.shape === "flat" || s.shape === "arc";
  const err = inputError || error;
  const len = (label: string, k: keyof LithoSettings, min: number, max: number, step: number, hint?: string) => (
    <NumberField label={label} value={s[k] as number} onChange={(v) => set(k, v as never)} min={min} max={max} step={step} length hint={hint} />
  );

  return (
    <ToolShell
      onReset={reset}
      input={
        <div className="space-y-3">
          <DropZone accept={RASTER_ACCEPT} onFiles={onFiles} title="Choose a photo" hint="JPG, PNG or WebP" compact={!!bitmap} fileLabel={fileName} />
          {bitmap && <CropPreview bitmap={bitmap} s={s} aspect={aspect} onPan={(x, y) => setSettings((c) => ({ ...c, panX: x, panY: y }))} />}
          {err && <ErrorNote>{err}</ErrorNote>}
          {result?.warnings.map((w) => <p key={w} className="text-xs text-amber-700 dark:text-amber-300">{w}</p>)}
        </div>
      }
      preview={
        <PreviewPanel
          ref={preview}
          meshes={meshes}
          busy={busy}
          fitKey={`${fileKey}-${s.shape}`}
          info={
            result
              ? {
                  size: result.size,
                  triangles: result.triangles,
                  watertight: result.watertight,
                  extra: est
                    ? [
                        { label: "Volume (est.)", value: `${est.cm3.toFixed(1)} cm³` },
                        { label: "PLA weight (est.)", value: `${est.grams.toFixed(0)} g` },
                        { label: "Filament (est.)", value: `${est.metres.toFixed(1)} m` },
                        { label: "Print time (rough)", value: formatTime(est.seconds) },
                      ]
                    : undefined,
                }
              : undefined
          }
          empty="Your lithophane will appear here. Photos are processed on your device and never uploaded."
          toolbarExtra={
            <span role="group" aria-label="Preview mode" className="ml-auto inline-flex overflow-hidden rounded border border-[var(--border)]">
              {(["printed", "backlit", "heightmap"] as const).map((m) => (
                <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`px-2 py-1 capitalize ${mode === m ? "bg-brand-600 text-white" : ""}`}>
                  {m === "printed" ? "Printed" : m === "backlit" ? "Backlit" : "Thickness"}
                </button>
              ))}
            </span>
          }
        />
      }
      actions={
        <div className="space-y-3">
          <DownloadBar
            formats={["stl", "3mf", "obj"]}
            format={format}
            onFormat={setFormat}
            onDownload={(f) => downloadBuilt(slug, result!, f, `lithophane-${baseName(fileName || "photo")}`)}
            disabled={!result || busy}
            related={["image-to-stl", "stl-viewer", "keychain-maker"]}
            onReset={() => {
              setBitmap(null);
              setFileName("");
            }}
          />
          {est && <p className="text-xs text-[var(--muted)]">Weight, filament and time are rough estimates for solid PLA (1.24 g/cm³, 1.75 mm filament, ~4 mm³/s). Your slicer gives exact numbers.</p>}
          <details className="rounded-lg border border-[var(--border)] p-3 text-sm">
            <summary className="cursor-pointer font-semibold">Recommended print settings</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--muted)]">
              <li>White or natural PLA</li>
              <li>100% infill, 3+ walls</li>
              <li>0.12 mm layer height (0.08–0.16)</li>
              <li>
                {s.shape === "cylinder"
                  ? "Print standing on its base; no supports."
                  : s.shape === "arc"
                    ? "Print standing upright as exported; no supports."
                    : "Print standing upright as exported, with a 5–8 mm brim" + (s.stand ? " (the stand helps)." : ".")}
              </li>
              <li>Slow outer walls (20–30 mm/s)</li>
            </ul>
          </details>
        </div>
      }
      controls={
        <>
          <Group title="Shape & size">
            <SelectField<LithoShape> label="Shape" value={s.shape} onChange={(v) => set("shape", v)} options={SHAPES} />
            {s.shape === "cylinder" ? (
              <>
                {len("Diameter", "width", 30, 250, 1)}
                {len("Height", "cylinderHeight", 20, 250, 1)}
              </>
            ) : (
              len("Width", "width", 30, 300, 1, s.frame !== "none" ? "Image width; the border or frame adds to this." : undefined)
            )}
            {s.shape === "arc" && <NumberField label="Curve angle" value={s.arcAngle} onChange={(v) => set("arcAngle", v)} min={30} max={180} step={5} suffix="°" />}
          </Group>
          <Group title="Thickness">
            {len("Min thickness (light areas)", "minThickness", 0.4, 3, 0.05)}
            {len("Max thickness (dark areas)", "maxThickness", 1, 8, 0.05)}
            <NumberField label="Resolution" value={s.resolution} onChange={(v) => set("resolution", v)} min={100} max={400} step={10} suffix="px" hint="Points along the long edge. 180 is a good default; higher is sharper but slower." />
          </Group>
          <Group title="Image">
            {isFlat && (
              <SelectField<Aspect> label="Crop" value={s.aspect} onChange={(v) => set("aspect", v)} options={[{ value: "original", label: "Original proportions" }, { value: "1:1", label: "Square 1:1" }, { value: "4:3", label: "Landscape 4:3" }, { value: "3:4", label: "Portrait 3:4" }, { value: "16:9", label: "Wide 16:9" }, { value: "9:16", label: "Tall 9:16" }]} />
            )}
            <NumberField label="Zoom" value={s.zoom} onChange={(v) => set("zoom", v)} min={1} max={4} step={0.05} suffix="×" />
            <NumberField label="Brightness" value={s.brightness} onChange={(v) => set("brightness", v)} min={-1} max={1} step={0.05} />
            <NumberField label="Contrast" value={s.contrast} onChange={(v) => set("contrast", v)} min={-1} max={1} step={0.05} />
            <NumberField label="Gamma" value={s.gamma} onChange={(v) => set("gamma", v)} min={0.3} max={3} step={0.05} />
            <Toggle label="Auto-enhance" checked={s.autoEnhance} onChange={(v) => set("autoEnhance", v)} hint="Stretches the histogram so the photo uses the full light-to-dark range." />
            <Toggle label="Invert" checked={s.invert} onChange={(v) => set("invert", v)} />
            <Toggle label="Mirror" checked={s.mirror} onChange={(v) => set("mirror", v)} />
          </Group>
          <Group title="Frame & extras" defaultOpen={false}>
            <Segmented label={s.shape === "cylinder" ? "Rims" : "Edge"} value={s.frame} onChange={(v) => set("frame", v)} options={[{ value: "none", label: "None" }, { value: "border", label: "Border" }, { value: "frame", label: "Frame" }]} />
            {s.frame !== "none" && len(s.shape === "cylinder" ? "Rim height" : "Border width", "frameWidth", 1, 20, 0.5)}
            {s.frame === "frame" && len("Frame depth", "frameDepth", 2, 15, 0.5)}
            {s.shape === "cylinder" ? (
              <>
                <Segmented label="Bottom" value={s.cylinderBase} onChange={(v) => set("cylinderBase", v)} options={[{ value: "open", label: "Open" }, { value: "ring", label: "Base with light hole" }]} />
                {s.cylinderBase === "ring" && len("Light hole diameter", "lightHole", 0, 200, 1, "40 mm fits a typical LED tea light.")}
              </>
            ) : (
              <>
                {s.shape === "flat" && <Toggle label="Stand (foot)" checked={s.stand} onChange={(v) => set("stand", v)} />}
                <SelectField label="Hanging hole" value={s.hole} onChange={(v) => set("hole", v)} options={[{ value: "none", label: "None" }, { value: "tab", label: "Tab" }, { value: "loop", label: "Loop" }, ...(isFlat ? [{ value: "inside" as const, label: "Inside (top border)" }] : [])]} />
                {s.hole !== "none" && len("Hole diameter", "holeDiameter", 2, 10, 0.5)}
              </>
            )}
          </Group>
          {isFlat && (
            <Group title="Text" defaultOpen={false}>
              <TextField label="Text" value={s.text} onChange={(v) => set("text", v)} placeholder="e.g. Summer 2026" />
              {s.text.trim() && (
                <>
                  <SelectField<FontKey> label="Font" value={s.textFont} onChange={(v) => set("textFont", v)} options={(Object.keys(FONTS) as FontKey[]).map((k) => ({ value: k, label: FONTS[k].label }))} />
                  <Segmented label="Position" value={s.textPosition} onChange={(v) => set("textPosition", v)} options={[{ value: "bottom", label: "Bottom" }, { value: "top", label: "Top" }]} />
                  <Segmented label="Style" value={s.textStyle} onChange={(v) => set("textStyle", v)} options={[{ value: "engraved", label: "Engraved" }, { value: "raised", label: "Raised" }]} />
                  <NumberField label="Band size" value={s.textSize} onChange={(v) => set("textSize", v)} min={5} max={30} step={1} suffix="%" />
                </>
              )}
            </Group>
          )}
        </>
      }
    />
  );
}
