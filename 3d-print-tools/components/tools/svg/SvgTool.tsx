"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { ToolProps } from "../ToolMount";
import type { ExportFormat } from "@/content/types";
import { DropZone } from "@/components/ui/DropZone";
import { ColorField, Group, NumberField, Segmented, SelectField, TextField, Toggle } from "@/components/ui/fields";
import { PreviewPanel } from "../shared/PreviewPanel";
import { DownloadBar } from "../shared/DownloadBar";
import { ErrorNote, ToolShell } from "../shared/ToolShell";
import { useBuild } from "../shared/useBuild";
import { downloadBuilt, toInfo, toViewMeshes } from "../shared/result";
import { SAMPLE_SVG } from "../shared/samples";
import { useSettings } from "@/lib/useSettings";
import { SVG_DEFAULTS, type LayerOverride, type SvgMode, type SvgSettings } from "@/lib/engines/svg/settings";
import { colorDistance, detectBackground, parseSvg } from "@/lib/engines/svg/parse";
import { FONTS, type FontKey } from "@/lib/engines/text";
import { UserError, type VectorInput } from "@/lib/engines/types";
import { baseName } from "@/lib/download";
import { fileType, track } from "@/lib/analytics";

const MODES: { value: SvgMode; label: string }[] = [
  { value: "extrude", label: "Extrude" },
  { value: "stencil", label: "Stencil" },
  { value: "keychain", label: "Keychain" },
  { value: "cookie", label: "Cutter" },
];

export default function SvgTool({ slug, preset, defaultFormat, initialSvg }: ToolProps & { initialSvg?: { text: string; name: string } }) {
  const { settings: s, update, reset } = useSettings<SvgSettings>(`pb:${slug}`, SVG_DEFAULTS, preset as Partial<SvgSettings>, ["source"]);
  const [svgText, setSvgText] = useState<string | null>(initialSvg?.text ?? null);
  const [fileName, setFileName] = useState(initialSvg?.name ?? "");
  const [fileKey, setFileKey] = useState(0);
  const [inputError, setInputError] = useState("");
  const [bgColor, setBgColor] = useState<string | null>(() => {
    try {
      return initialSvg ? detectBackground(parseSvg(initialSvg.text, "low")) : null;
    } catch {
      return null;
    }
  });
  const [overrides, setOverrides] = useState<Record<string, LayerOverride>>({});
  const [format, setFormat] = useState<ExportFormat>(defaultFormat ?? "stl");
  const isText = s.source === "text";

  const set = <K extends keyof SvgSettings>(k: K, v: SvgSettings[K]) => {
    update(k, v);
    track("settings_changed", { tool: slug });
  };

  // ---- input ---------------------------------------------------------
  const parsed = useMemo<{ input: VectorInput | null; error: string }>(() => {
    if (!svgText) return { input: null, error: "" };
    try {
      return { input: parseSvg(svgText, s.curve), error: "" };
    } catch (e) {
      return { input: null, error: e instanceof UserError ? e.message : "This SVG couldn't be read." };
    }
  }, [svgText, s.curve]);

  const loadText = useCallback((text: string, name: string) => {
    setSvgText(text);
    setFileName(name);
    setFileKey((k) => k + 1);
    setOverrides({});
    try {
      const input = parseSvg(text, "low");
      setBgColor(detectBackground(input));
    } catch {
      setBgColor(null);
    }
  }, []);

  const onFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setInputError("");
    track("file_uploaded", { tool: slug, file_type: fileType(f) });
    if (!/svg/i.test(f.type) && !/\.svg$/i.test(f.name)) {
      setInputError("unsupported");
      track("error", { tool: slug, error_code: "not_svg" });
      return;
    }
    loadText(await f.text(), f.name);
  }, [slug, loadText]);

  const input = isText ? null : parsed.input;
  const hidden = useMemo(() => {
    if (!input || !s.removeBackground || !bgColor || isText) return [];
    return input.layers.filter((l) => colorDistance(l.color, bgColor) <= s.bgTolerance).map((l) => l.color);
  }, [input, s.removeBackground, bgColor, s.bgTolerance, isText]);

  // ---- build ---------------------------------------------------------
  const { result, busy, error } = useBuild(
    slug,
    isText
      ? (api) => api.buildText({ text: s.text, font: s.font, letterSpacing: s.letterSpacing }, { settings: s })
      : input
        ? (api) => api.buildVector({ input, settings: s, hiddenColors: hidden, layers: overrides })
        : null,
    [input, s, hidden, overrides],
  );
  const meshes = useMemo(() => toViewMeshes(result), [result]);

  const name = isText ? baseName(s.text.split("\n")[0] || "text") : baseName(fileName || "model");
  const download = (f: ExportFormat) => downloadBuilt(slug, result!, f, name);

  const layerRows = input && !isText ? input.layers : [];
  const setOverride = (id: string, patch: Partial<LayerOverride>) =>
    setOverrides((o) => ({ ...o, [id]: { ...(o[id] ?? { visible: true, height: null, z: 0 }), ...patch } }));

  const mode = s.mode;
  const err = inputError === "unsupported" ? null : inputError || parsed.error || error;

  return (
    <ToolShell
      onReset={() => {
        reset();
        setOverrides({});
      }}
      input={
        <div className="space-y-3">
          {isText ? (
            <div className="space-y-3">
              <TextField label="Text" value={s.text} onChange={(v) => set("text", v)} multiline placeholder="Type your text" />
              <SelectField<FontKey> label="Font" value={s.font} onChange={(v) => set("font", v)} options={(Object.keys(FONTS) as FontKey[]).map((k) => ({ value: k, label: FONTS[k].label }))} />
            </div>
          ) : (
            <>
              <DropZone accept=".svg,image/svg+xml" onFiles={onFiles} title="Choose an SVG file" hint="Or paste SVG code" compact={!!svgText} fileLabel={fileName} />
              {!svgText && (
                <button type="button" className="text-sm text-brand-600 underline dark:text-brand-100" onClick={() => loadText(SAMPLE_SVG, "sample-heart.svg")}>
                  No file handy? Try a sample
                </button>
              )}
            </>
          )}
          {inputError === "unsupported" && (
            <ErrorNote>
              That isn&apos;t an SVG. For PNG, JPG or WebP images use the <Link className="underline" href="/image-to-stl">Image to STL</Link> tool.
            </ErrorNote>
          )}
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
          fitKey={`${fileKey}-${mode}-${isText}`}
          info={toInfo(result)}
          empty={isText ? "Type some text to see the model." : "Your 3D model will appear here. SVGs are processed on your device."}
        />
      }
      actions={
        <DownloadBar
          formats={["stl", "3mf", "obj", "glb"]}
          format={format}
          onFormat={setFormat}
          onDownload={download}
          disabled={!result || busy}
          related={mode === "keychain" ? ["cookie-cutter-maker", "text-to-stl", "lithophane-maker"] : ["keychain-maker", "image-to-stl", "lithophane-maker"]}
          onReset={isText ? undefined : () => { setSvgText(null); setFileName(""); }}
        />
      }
      controls={
        <>
          <Group title="Mode">
            <Segmented label="What to make" value={mode} onChange={(v) => set("mode", v)} options={MODES} />
          </Group>
          <Group title="Size">
            <NumberField label={mode === "cookie" ? "Cutter width" : "Real width"} value={s.width} onChange={(v) => set("width", v)} min={5} max={300} step={0.5} length hint="The artwork is scaled so its width is exactly this size." />
            {isText ? (
              <NumberField label="Letter spacing" value={s.letterSpacing} onChange={(v) => set("letterSpacing", v)} min={-0.1} max={0.5} step={0.01} suffix="em" />
            ) : (
              <SelectField label="Curve resolution" value={s.curve} onChange={(v) => set("curve", v)} options={[{ value: "low", label: "Low (fast, faceted)" }, { value: "medium", label: "Medium" }, { value: "high", label: "High (smooth curves)" }]} />
            )}
          </Group>

          {mode === "extrude" && (
            <Group title="Extrude">
              <NumberField label="Height" value={s.height} onChange={(v) => set("height", v)} min={0.1} max={50} step={0.1} length />
              <NumberField label="Smooth edges (bevel)" value={s.bevel} onChange={(v) => set("bevel", v)} min={0} max={2} step={0.1} length />
              <NumberField label="Base plate thickness" value={s.baseThickness} onChange={(v) => set("baseThickness", v)} min={0} max={10} step={0.2} length hint="0 = no base. A base joins separate shapes into one piece." />
              {s.baseThickness > 0 && <NumberField label="Base margin" value={s.baseMargin} onChange={(v) => set("baseMargin", v)} min={0} max={30} step={0.5} length />}
            </Group>
          )}

          {mode === "stencil" && (
            <Group title="Stencil">
              <Segmented label="Cut" value={s.stencilCut} onChange={(v) => set("stencilCut", v)} options={[{ value: "through", label: "Through" }, { value: "recess", label: "Recess" }]} />
              {s.stencilCut === "recess" && <NumberField label="Recess depth" value={s.recessDepth} onChange={(v) => set("recessDepth", v)} min={0.2} max={10} step={0.1} length />}
              <NumberField label="Plate thickness" value={s.plateThickness} onChange={(v) => set("plateThickness", v)} min={0.6} max={10} step={0.1} length />
              <NumberField label="Plate margin" value={s.plateMargin} onChange={(v) => set("plateMargin", v)} min={1} max={40} step={0.5} length />
            </Group>
          )}

          {mode === "keychain" && (
            <Group title="Keychain">
              <SelectField label="Plate shape" value={s.plateShape} onChange={(v) => set("plateShape", v)} options={[{ value: "rounded", label: "Rounded rectangle" }, { value: "circle", label: "Circle" }, { value: "hex", label: "Hexagon" }, { value: "outline", label: "Outline (follows the artwork)" }]} />
              <NumberField label="Plate thickness" value={s.plateThickness} onChange={(v) => set("plateThickness", v)} min={1} max={10} step={0.1} length />
              <NumberField label="Plate margin" value={s.plateMargin} onChange={(v) => set("plateMargin", v)} min={0.5} max={20} step={0.5} length />
              <Segmented label="Artwork" value={s.artStyle} onChange={(v) => set("artStyle", v)} options={[{ value: "raised", label: "Raised" }, { value: "flush", label: "Flush" }, { value: "engraved", label: "Engraved" }]} />
              <NumberField label={s.artStyle === "raised" ? "Artwork height" : "Artwork depth"} value={s.artDepth} onChange={(v) => set("artDepth", v)} min={0.2} max={5} step={0.1} length />
              <Segmented label="Keyring loop" value={s.loop} onChange={(v) => set("loop", v)} options={[{ value: "tab", label: "Tab" }, { value: "hole", label: "Inside hole" }, { value: "none", label: "None" }]} />
              {s.loop !== "none" && (
                <>
                  <Segmented label="Loop position" value={s.loopPosition} onChange={(v) => set("loopPosition", v)} options={[{ value: "top", label: "Top" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]} />
                  <NumberField label="Hole diameter" value={s.holeDiameter} onChange={(v) => set("holeDiameter", v)} min={2} max={12} step={0.5} length />
                </>
              )}
              {s.artStyle === "flush" && <p className="text-xs text-[var(--muted)]">Flush keeps the artwork as a separate part in 3MF for two-colour printing. STL contains one solid plate.</p>}
            </Group>
          )}

          {mode === "cookie" && (
            <Group title="Cookie cutter">
              <NumberField label="Wall thickness" value={s.wallThickness} onChange={(v) => set("wallThickness", v)} min={0.6} max={2} step={0.05} length />
              <NumberField label="Cutter height" value={s.cutterHeight} onChange={(v) => set("cutterHeight", v)} min={6} max={30} step={0.5} length />
              <NumberField label="Flange width" value={s.flangeWidth} onChange={(v) => set("flangeWidth", v)} min={0} max={10} step={0.5} length />
              <NumberField label="Flange thickness" value={s.flangeThickness} onChange={(v) => set("flangeThickness", v)} min={0.6} max={4} step={0.1} length />
            </Group>
          )}

          {!isText && (
            <Group title="Clean-up" defaultOpen={false}>
              <Toggle label="Remove background colour" checked={s.removeBackground} onChange={(v) => set("removeBackground", v)} hint={bgColor ? `Detected background: ${bgColor.toUpperCase()}` : "No background shape detected; pick a colour to remove."} />
              {s.removeBackground && (
                <>
                  <ColorField label="Background colour" value={bgColor ?? "#ffffff"} onChange={setBgColor} />
                  <NumberField label="Tolerance" value={s.bgTolerance} onChange={(v) => set("bgTolerance", v)} min={0} max={60} step={1} suffix="%" />
                </>
              )}
              <Toggle label="Include strokes (outlines)" checked={s.includeStrokes} onChange={(v) => set("includeStrokes", v)} />
              <NumberField label="Line width" value={s.lineWidth} onChange={(v) => set("lineWidth", v)} min={0} max={10} step={0.1} length hint="0 = use the stroke widths in the SVG. Set a value to thicken thin or stroke-only artwork." />
              <Toggle label="Close open shapes" checked={s.closeShapes} onChange={(v) => set("closeShapes", v)} />
            </Group>
          )}

          {layerRows.length > 0 && (
            <Group title={`Layers (${layerRows.length})`}>
              <ul className="space-y-2">
                {layerRows.map((l) => {
                  const o = overrides[l.id];
                  const isHidden = hidden.includes(l.color);
                  return (
                    <li key={l.id} className="rounded-lg border border-[var(--border)] p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded border border-black/20" style={{ background: l.color }} aria-hidden="true" />
                        <span className="flex-1 font-mono text-xs">{l.name}{isHidden ? " (background)" : ""}</span>
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={o?.visible !== false && !isHidden} disabled={isHidden} onChange={(e) => setOverride(l.id, { visible: e.target.checked })} />
                          Show
                        </label>
                      </div>
                      {mode === "extrude" && o?.visible !== false && !isHidden && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <label className="text-xs">
                            Height (mm)
                            <input type="number" step={0.1} min={0.1} className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5" value={o?.height ?? s.height} onChange={(e) => setOverride(l.id, { height: Math.max(0.1, parseFloat(e.target.value) || s.height) })} />
                          </label>
                          <label className="text-xs">
                            Z offset (mm)
                            <input type="number" step={0.1} min={0} className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5" value={o?.z ?? 0} onChange={(e) => setOverride(l.id, { z: Math.max(0, parseFloat(e.target.value) || 0) })} />
                          </label>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Group>
          )}
        </>
      }
    />
  );
}
