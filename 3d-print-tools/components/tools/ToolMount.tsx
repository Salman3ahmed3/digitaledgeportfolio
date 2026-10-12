"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Engine, ExportFormat } from "@/content/types";
import { UnitsProvider } from "@/components/ui/units";
import { ToolLinksProvider } from "./shared/links";

const ACCEPT: Record<Engine, string> = {
  image: ".png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,image/*",
  svg: ".svg,image/svg+xml",
  lithophane: ".png,.jpg,.jpeg,.webp,image/*",
  viewer: ".stl,.obj,.mtl,.3mf,.ply,.glb,.gltf",
};

/**
 * Lightweight stand-in rendered into the static HTML. It has the same
 * footprint as the real tool (no layout shift) and accepts a file, so the
 * heavy 3D engine only downloads once someone interacts with the page.
 */
function Placeholder({ engine, onFiles, loading }: { engine: Engine; onFiles: (f: File[]) => void; loading: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div className="tool-grid rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm sm:p-4" data-testid="tool-placeholder">
      <div className="ta-input min-w-0">
        <div
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)); }}
          className={`rounded-xl border-2 border-dashed p-6 ${over ? "border-brand-500" : "border-[var(--border)]"}`}
        >
          <input ref={input} type="file" accept={ACCEPT[engine]} multiple={engine === "viewer"} className="sr-only" tabIndex={-1} aria-hidden="true" data-testid="file-input" onChange={(e) => onFiles(Array.from(e.target.files ?? []))} />
          <button type="button" onClick={() => input.current?.click()} className="flex w-full flex-col items-center gap-2 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-brand-600" aria-hidden="true">
              <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
            <span className="font-semibold">{engine === "viewer" ? "Open a 3D file" : engine === "svg" ? "Choose a file" : "Choose an image"}</span>
            <span className="text-xs text-[var(--muted)]">Drop a file, click to browse, or paste (Ctrl/⌘ + V)</span>
          </button>
        </div>
      </div>
      <div className="ta-preview min-w-0">
        <div className="flex items-center justify-center rounded-xl border border-[var(--border)] text-sm text-[var(--muted)]">
          {loading ? "Loading the 3D engine…" : "Your 3D preview will appear here."}
        </div>
      </div>
      <div className="ta-actions min-w-0">
        <div className="h-12 rounded-lg bg-brand-600/40" aria-hidden="true" />
      </div>
      <div className="ta-controls min-w-0">
        <div className="h-[420px] rounded-lg bg-black/[0.03] dark:bg-white/[0.03]" aria-hidden="true" />
      </div>
    </div>
  );
}

const engines = {
  image: dynamic(() => import("./image/ImageTool")),
  svg: dynamic(() => import("./svg/SvgTool")),
  lithophane: dynamic(() => import("./lithophane/LithophaneTool")),
  viewer: dynamic(() => import("./viewer/ViewerTool")),
};

export interface ToolProps {
  slug: string;
  preset?: Record<string, unknown>;
  defaultFormat?: ExportFormat;
  /** Files picked before the engine finished loading. */
  initialFiles?: File[];
}

export function ToolMount({ engine, links, ...props }: ToolProps & { engine: Engine; links: Record<string, string> }) {
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [files, setFiles] = useState<File[] | undefined>();
  const activate = useCallback(() => setActive(true), []);

  // Load the engine on the first sign of interaction (or a file), never during initial page load.
  useEffect(() => {
    if (active) return;
    const evs = ["pointermove", "pointerdown", "touchstart", "keydown", "scroll", "dragenter", "paste", "focusin"] as const;
    evs.forEach((e) => window.addEventListener(e, activate, { once: true, passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, activate));
  }, [active, activate]);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    // Resolve the chunk before swapping so the placeholder stays until the tool can render.
    const load = { image: () => import("./image/ImageTool"), svg: () => import("./svg/SvgTool"), lithophane: () => import("./lithophane/LithophaneTool"), viewer: () => import("./viewer/ViewerTool") }[engine];
    load().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [active, engine]);

  const Comp = engines[engine];
  return (
    <ToolLinksProvider links={links}>
      <noscript>
        <div className="mb-3 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-900">
          This tool runs in your browser and needs JavaScript and WebGL. Please enable JavaScript to use it.
        </div>
      </noscript>
      {ready ? (
        <UnitsProvider>
          <Comp {...props} initialFiles={files} />
        </UnitsProvider>
      ) : (
        <Placeholder
          engine={engine}
          loading={active}
          onFiles={(f) => {
            if (!f.length) return;
            setFiles(f);
            setActive(true);
          }}
        />
      )}
    </ToolLinksProvider>
  );
}
