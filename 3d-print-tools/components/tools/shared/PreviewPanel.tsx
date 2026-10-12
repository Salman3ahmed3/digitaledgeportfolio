"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Viewport, type Shading, type ViewMesh, type ViewPreset } from "@/lib/three/Viewport";
import { fmtLen, useUnits } from "@/components/ui/units";
import { formatBytes } from "@/lib/download";

export interface PreviewInfo {
  size?: [number, number, number];
  triangles?: number;
  watertight?: boolean;
  extra?: { label: string; value: string }[];
}

export interface PreviewHandle {
  viewport: () => Viewport | null;
}

const PRESETS: { v: ViewPreset; label: string }[] = [
  { v: "iso", label: "Iso" }, { v: "front", label: "Front" }, { v: "back", label: "Back" }, { v: "left", label: "Left" },
  { v: "right", label: "Right" }, { v: "top", label: "Top" }, { v: "bottom", label: "Bottom" },
];

/** 3D preview with toolbar + dimension/triangle readout. */
export const PreviewPanel = forwardRef<PreviewHandle, {
  meshes: ViewMesh[];
  busy?: boolean;
  status?: string;
  info?: PreviewInfo;
  empty?: React.ReactNode;
  /** Re-fit the camera when this key changes (e.g. new file), not on every rebuild. */
  fitKey?: string | number;
  toolbarExtra?: React.ReactNode;
  className?: string;
  onReady?: (v: Viewport) => void;
}>(function PreviewPanel({ meshes, busy, status, info, empty, fitKey, toolbarExtra, className = "", onReady }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const vp = useRef<Viewport | null>(null);
  const lastFit = useRef<string | number | undefined>(undefined);
  const [grid, setGrid] = useState(true);
  const [shading, setShading] = useState<Shading>("smooth");
  const [webglError, setWebglError] = useState(false);
  const { units } = useUnits();

  useImperativeHandle(ref, () => ({ viewport: () => vp.current }), []);

  useEffect(() => {
    if (!host.current) return;
    try {
      const v = new Viewport(host.current);
      vp.current = v;
      const syncTheme = () => v.setDark(document.documentElement.classList.contains("dark"));
      syncTheme();
      const mo = new MutationObserver(syncTheme);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      onReady?.(v);
      return () => {
        mo.disconnect();
        v.dispose();
        vp.current = null;
      };
    } catch {
      setWebglError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const v = vp.current;
    if (!v) return;
    const fit = lastFit.current !== fitKey || lastFit.current === undefined;
    v.setMeshes(meshes, fit && meshes.length > 0);
    if (fit && meshes.length > 0) lastFit.current = fitKey;
  }, [meshes, fitKey]);

  const stlBytes = info?.triangles != null ? 84 + info.triangles * 50 : null;
  const hasModel = meshes.length > 0;

  return (
    <div className={`relative flex min-h-[360px] flex-col overflow-hidden rounded-xl border border-[var(--border)] ${className}`}>
      <div className="relative min-h-0 flex-1" ref={host} data-testid="preview-canvas">
        {webglError && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm">
            Your browser could not start WebGL, which the 3D preview needs. Try another browser or enable hardware acceleration.
          </div>
        )}
        {!hasModel && !busy && empty && <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-[var(--muted)]">{empty}</div>}
        {busy && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-[var(--surface)]/90 px-3 py-1 text-xs shadow" role="status" aria-live="polite">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-hidden="true" />
            {status ?? "Building…"}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1 border-t border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs">
        <button type="button" className="rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => vp.current?.fit("iso")}>Reset view</button>
        <label className="sr-only" htmlFor="view-preset">View</label>
        <select id="view-preset" className="rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-1" defaultValue="" onChange={(e) => { if (e.target.value) vp.current?.fit(e.target.value as ViewPreset); e.target.value = ""; }}>
          <option value="" disabled>View…</option>
          {PRESETS.map((p) => <option key={p.v} value={p.v}>{p.label}</option>)}
        </select>
        <button type="button" aria-pressed={grid} className={`rounded px-2 py-1 ${grid ? "bg-black/5 dark:bg-white/10" : ""}`} onClick={() => { setGrid(!grid); vp.current?.setGrid(!grid); }}>Grid</button>
        <button type="button" aria-pressed={shading === "wireframe"} className={`rounded px-2 py-1 ${shading === "wireframe" ? "bg-black/5 dark:bg-white/10" : ""}`} onClick={() => { const s = shading === "wireframe" ? "smooth" : "wireframe"; setShading(s); vp.current?.setShading(s); }}>Wireframe</button>
        {toolbarExtra}
      </div>

      {hasModel && info && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs sm:grid-cols-4" data-testid="model-info">
          {info.size && (
            <div className="col-span-2">
              <dt className="text-[var(--muted)]">Size (X × Y × Z)</dt>
              <dd className="font-medium tabular-nums" data-testid="dims">
                {info.size.map((s) => fmtLen(s, units, 1).replace(/ (mm|in)$/, "")).join(" × ")} {units}
              </dd>
            </div>
          )}
          {info.triangles != null && (
            <div>
              <dt className="text-[var(--muted)]">Triangles</dt>
              <dd className="font-medium tabular-nums" data-testid="triangles">{info.triangles.toLocaleString()}</dd>
            </div>
          )}
          {stlBytes != null && (
            <div>
              <dt className="text-[var(--muted)]">STL size (est.)</dt>
              <dd className="font-medium tabular-nums">{formatBytes(stlBytes)}</dd>
            </div>
          )}
          {info.watertight != null && (
            <div>
              <dt className="text-[var(--muted)]">Watertight</dt>
              <dd className={`font-medium ${info.watertight ? "text-green-600" : "text-amber-600"}`}>{info.watertight ? "Yes" : "No"}</dd>
            </div>
          )}
          {info.extra?.map((e) => (
            <div key={e.label}>
              <dt className="text-[var(--muted)]">{e.label}</dt>
              <dd className="font-medium tabular-nums">{e.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
});
