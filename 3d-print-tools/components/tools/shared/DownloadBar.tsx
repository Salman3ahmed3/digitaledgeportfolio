"use client";

import Link from "next/link";
import { useState } from "react";
import type { ExportFormat } from "@/content/types";
import { FORMATS } from "@/lib/geometry/export";
import { toolBySlug } from "@/content/tools";

/**
 * Format picker + primary download button, followed by a short
 * "file ready" state with next steps.
 */
export function DownloadBar({
  formats, format, onFormat, onDownload, disabled, related = [], onReset, label = "Download",
}: {
  formats: ExportFormat[];
  format: ExportFormat;
  onFormat: (f: ExportFormat) => void;
  onDownload: (f: ExportFormat) => Promise<void>;
  disabled?: boolean;
  related?: string[];
  onReset?: () => void;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const go = async () => {
    setState("working");
    try {
      await onDownload(format);
      setState("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export failed");
      setState("error");
    }
  };
  const suggestions = related.map(toolBySlug).filter(Boolean).slice(0, 3);
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <label htmlFor="export-format" className="sr-only">File format</label>
        <select
          id="export-format"
          value={format}
          onChange={(e) => onFormat(e.target.value as ExportFormat)}
          className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 text-sm font-medium"
        >
          {formats.map((f) => (
            <option key={f} value={f}>{FORMATS[f].label}</option>
          ))}
        </select>
        <button
          type="button"
          data-testid="download"
          onClick={go}
          disabled={disabled || state === "working"}
          className="flex-1 rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === "working" ? "Preparing…" : `${label} ${FORMATS[format].ext.toUpperCase()}`}
        </button>
      </div>
      {state === "error" && <p className="text-sm text-red-600" role="alert">{err}</p>}
      {state === "done" && (
        <div className="rounded-lg border border-green-600/30 bg-green-50 p-3 text-sm dark:bg-green-900/20" role="status" data-testid="download-done">
          <p className="font-semibold text-green-800 dark:text-green-300">Your file is ready — check your downloads.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {onReset && (
              <button type="button" onClick={() => { setState("idle"); onReset(); }} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1 font-medium">
                Make another
              </button>
            )}
            {suggestions.map((t) => (
              <Link key={t!.slug} href={`/${t!.slug}`} className="text-brand-600 underline dark:text-brand-100">
                {t!.shortName}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
