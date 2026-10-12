"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ToolProps } from "../ToolMount";
import type { ExportFormat } from "@/content/types";
import { DropZone } from "@/components/ui/DropZone";
import { ColorField, Group, NumberField, Segmented, SelectField, Toggle } from "@/components/ui/fields";
import { PreviewPanel } from "../shared/PreviewPanel";
import { DownloadBar } from "../shared/DownloadBar";
import { ErrorNote, ToolShell } from "../shared/ToolShell";
import { useBuild } from "../shared/useBuild";
import { downloadBuilt, toInfo, toViewMeshes } from "../shared/result";
import { openBitmap, rasterize, RASTER_ACCEPT } from "../shared/decode";
import SvgTool from "../svg/SvgTool";
import { useSettings } from "@/lib/useSettings";
import { IMAGE_DEFAULTS, type ImageMode, type ImageSettings } from "@/lib/engines/image/settings";
import { cornerColor, type DepthCurve, type Rgba } from "@/lib/engines/image/pixels";
import { baseName } from "@/lib/download";
import { fileType, track } from "@/lib/analytics";

export default function ImageTool({ slug, preset, defaultFormat }: ToolProps) {
  const { settings: s, update, reset } = useSettings<ImageSettings>(`pb:${slug}`, IMAGE_DEFAULTS, preset as Partial<ImageSettings>);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const [inputError, setInputError] = useState("");
  const [svg, setSvg] = useState<{ text: string; name: string } | null>(null);
  const [format, setFormat] = useState<ExportFormat>(defaultFormat ?? "stl");

  const set = <K extends keyof ImageSettings>(k: K, v: ImageSettings[K]) => {
    update(k, v);
    track("settings_changed", { tool: slug });
  };

  const onFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setInputError("");
    track("file_uploaded", { tool: slug, file_type: fileType(f) });
    if (/svg/i.test(f.type) || /\.svg$/i.test(f.name)) {
      setSvg({ text: await f.text(), name: f.name });
      return;
    }
    try {
      const bmp = await openBitmap(f);
      setBitmap((old) => {
        old?.close();
        return bmp;
      });
      setFileName(f.name);
      setFileKey((k) => k + 1);
    } catch (e) {
      setInputError((e as Error).message);
      track("error", { tool: slug, error_code: "decode_failed" });
    }
  }, [slug]);

  const img = useMemo<Rgba | null>(() => (bitmap ? rasterize(bitmap, s.maxEdge) : null), [bitmap, s.maxEdge]);
  const autoBg = useMemo(() => (img ? cornerColor(img) : "#ffffff"), [img]);

  const { result, busy, error } = useBuild(slug, img ? (api) => api.buildImage(img, s) : null, [img, s]);
  const meshes = useMemo(() => toViewMeshes(result), [result]);

  // Free the bitmap on unmount.
  useEffect(() => () => bitmap?.close(), [bitmap]);

  if (svg) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-brand-500/40 bg-brand-50 p-3 text-sm dark:bg-brand-700/20">
          SVG detected — switched to the SVG engine, which keeps vector shapes exact.{" "}
          <button type="button" className="underline" onClick={() => setSvg(null)}>Back to image mode</button>
        </p>
        <SvgTool slug="svg-to-stl" initialSvg={svg} defaultFormat={format} />
      </div>
    );
  }

  const mode = s.mode;
  const err = inputError || error;
  const lengthField = (label: string, k: keyof ImageSettings, min: number, max: number, step: number, hint?: string) => (
    <NumberField label={label} value={s[k] as number} onChange={(v) => set(k, v as never)} min={min} max={max} step={step} length hint={hint} />
  );

  return (
    <ToolShell
      onReset={reset}
      input={
        <div className="space-y-3">
          <DropZone accept={`${RASTER_ACCEPT},.svg`} onFiles={onFiles} title="Choose an image" hint="PNG, JPG or WebP (SVG also accepted)" compact={!!bitmap} fileLabel={fileName} />
          {err && <ErrorNote>{err}</ErrorNote>}
          {result?.warnings.map((w) => (
            <p key={w} className="text-xs text-amber-700 dark:text-amber-300">{w}</p>
          ))}
        </div>
      }
      preview={
        <PreviewPanel
          meshes={meshes}
          busy={busy}
          fitKey={`${fileKey}-${mode}`}
          info={toInfo(result)}
          empty="Your 3D model will appear here. Images are processed on your device and never uploaded."
        />
      }
      actions={
        <DownloadBar
          formats={["stl", "3mf", "obj"]}
          format={format}
          onFormat={setFormat}
          onDownload={(f) => downloadBuilt(slug, result!, f, baseName(fileName || "image"))}
          disabled={!result || busy}
          related={["lithophane-maker", "svg-to-stl", "keychain-maker"]}
          onReset={() => {
            setBitmap(null);
            setFileName("");
          }}
        />
      }
      controls={
        <>
          <Group title="Mode">
            <Segmented<ImageMode>
              label="Conversion"
              value={mode}
              onChange={(v) => set("mode", v)}
              options={[{ value: "heightmap", label: "Heightmap (relief)" }, { value: "extrude", label: "Extrude (logo)" }]}
            />
            <p className="text-xs text-[var(--muted)]">
              {mode === "heightmap" ? "Brightness becomes height — good for photos, textures and terrain." : "The image is traced into outlines and extruded — good for logos, icons and silhouettes."}
            </p>
          </Group>
          <Group title="Size">
            {lengthField("Width", "width", 10, 400, 1, mode === "extrude" ? "Width of the traced shape. Height follows the aspect ratio." : "Height follows the image's aspect ratio.")}
            <SelectField<number>
              label="Image resolution"
              value={s.maxEdge}
              onChange={(v) => set("maxEdge", v)}
              options={[400, 800, 1200, 2000].map((v) => ({ value: v, label: `${v} px long edge${v === 2000 ? " (slow)" : ""}` }))}
              hint="The image is downscaled to this size before converting. Higher = more detail and bigger files."
            />
          </Group>

          {mode === "heightmap" ? (
            <>
              <Group title="Relief">
                {lengthField("Max height", "maxHeight", 0.2, 30, 0.1)}
                {lengthField("Min height", "minHeight", 0, 10, 0.1)}
                {lengthField("Base thickness", "baseThickness", 0, 10, 0.1, "0 = no base.")}
                <Toggle label="Invert (dark = high)" checked={s.invert} onChange={(v) => set("invert", v)} />
                <Toggle label="Mirror" checked={s.mirror} onChange={(v) => set("mirror", v)} />
              </Group>
              <Group title="Detail & smoothing">
                <Segmented label="Detail" value={s.detail} onChange={(v) => set("detail", v)} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
                <SelectField<DepthCurve>
                  label="Depth curve"
                  value={s.curve}
                  onChange={(v) => set("curve", v)}
                  options={[{ value: "linear", label: "Linear" }, { value: "ease-in", label: "Ease in (more detail in highlights)" }, { value: "ease-out", label: "Ease out (more detail in shadows)" }, { value: "gamma", label: "Custom gamma" }]}
                />
                {s.curve === "gamma" && <NumberField label="Gamma" value={s.gamma} onChange={(v) => set("gamma", v)} min={0.2} max={4} step={0.05} />}
                <NumberField label="Smoothing" value={s.smoothing} onChange={(v) => set("smoothing", v)} min={0} max={5} step={0.5} suffix="px" hint="Blurs the image first to reduce noise and spiky surfaces." />
              </Group>
            </>
          ) : (
            <>
              <Group title="Detect shape">
                <Toggle label="Remove background colour" checked={s.removeBackground} onChange={(v) => set("removeBackground", v)} hint="Keeps every pixel that differs from the background colour — best for coloured logos." />
                {s.removeBackground ? (
                  <>
                    <ColorField label={`Background${s.bgColor ? "" : " (auto)"}`} value={s.bgColor || autoBg} onChange={(v) => set("bgColor", v)} />
                    {s.bgColor && <button type="button" className="text-xs underline" onClick={() => set("bgColor", "")}>Use auto-detected colour</button>}
                    <NumberField label="Tolerance" value={s.bgTolerance} onChange={(v) => set("bgTolerance", v)} min={1} max={80} step={1} suffix="%" />
                  </>
                ) : (
                  <>
                    <Toggle label="Automatic threshold" checked={s.threshold < 0} onChange={(v) => set("threshold", v ? -1 : 128)} />
                    {s.threshold >= 0 && <NumberField label="Threshold" value={s.threshold} onChange={(v) => set("threshold", v)} min={1} max={254} step={1} hint="Pixels darker than this become part of the shape." />}
                    <Toggle label="Invert (light shape on dark background)" checked={s.invertMask} onChange={(v) => set("invertMask", v)} />
                  </>
                )}
                <NumberField label="Remove specks smaller than" value={s.minSpeck} onChange={(v) => set("minSpeck", v)} min={0} max={500} step={5} suffix="px²" />
                <NumberField label="Outline smoothing" value={s.outlineSmooth} onChange={(v) => set("outlineSmooth", v)} min={0} max={3} step={1} />
                <NumberField label="Outline simplification" value={s.outlineSimplify} onChange={(v) => set("outlineSimplify", v)} min={0} max={3} step={0.1} suffix="px" />
              </Group>
              <Group title="Extrude">
                {lengthField("Extrude height", "extrudeHeight", 0.2, 30, 0.1)}
                <Segmented label="Height" value={s.heightMode} onChange={(v) => set("heightMode", v)} options={[{ value: "same", label: "Same height" }, { value: "brightness", label: "By brightness" }]} />
                {s.heightMode === "brightness" && <NumberField label="Levels" value={s.levels} onChange={(v) => set("levels", v)} min={2} max={6} step={1} hint="Darker areas stand taller." />}
                <Segmented label="Base" value={s.logoBase} onChange={(v) => set("logoBase", v)} options={[{ value: "none", label: "None" }, { value: "rect", label: "Rectangle" }, { value: "outline", label: "Outline" }]} />
                {s.logoBase !== "none" && (
                  <>
                    {lengthField("Base thickness", "logoBaseThickness", 0.4, 10, 0.1)}
                    {lengthField("Base margin", "logoBaseMargin", 0, 30, 0.5)}
                  </>
                )}
                <Toggle label="Keyring loop" checked={s.keyring} onChange={(v) => set("keyring", v)} />
                {s.keyring && (
                  <>
                    <Segmented label="Loop position" value={s.keyringPosition} onChange={(v) => set("keyringPosition", v)} options={[{ value: "top", label: "Top" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
                    {lengthField("Hole diameter", "holeDiameter", 2, 12, 0.5)}
                  </>
                )}
              </Group>
            </>
          )}
        </>
      }
    />
  );
}
