"use client";

import dynamic from "next/dynamic";
import type { Engine, ExportFormat } from "@/content/types";

const Loading = () => (
  <div className="flex min-h-[560px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] lg:min-h-[620px]">
    Loading tool…
  </div>
);

// Each engine is its own chunk: three.js, workers and WASM never load on pages
// that don't need them, and never before the page is interactive.
const engines = {
  image: dynamic(() => import("./image/ImageTool"), { ssr: false, loading: Loading }),
  svg: dynamic(() => import("./svg/SvgTool"), { ssr: false, loading: Loading }),
  lithophane: dynamic(() => import("./lithophane/LithophaneTool"), { ssr: false, loading: Loading }),
  viewer: dynamic(() => import("./viewer/ViewerTool"), { ssr: false, loading: Loading }),
};

export interface ToolProps {
  slug: string;
  preset?: Record<string, unknown>;
  defaultFormat?: ExportFormat;
}

export function ToolMount({ engine, ...props }: ToolProps & { engine: Engine }) {
  const Comp = engines[engine];
  return (
    <>
      <noscript>
        <div className="rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-900">
          This tool runs in your browser and needs JavaScript and WebGL. Please enable JavaScript to use it.
        </div>
      </noscript>
      <Comp {...props} />
    </>
  );
}
