"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Drag & drop, click-to-browse and paste-from-clipboard file input.
 * Paste is captured page-wide while the zone is mounted (unless focus is in a text field).
 */
export function DropZone({
  accept, multiple = false, onFiles, title, hint, compact = false, fileLabel,
}: {
  accept: string; multiple?: boolean; onFiles: (files: File[]) => void; title: string; hint?: string;
  compact?: boolean; fileLabel?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) {
        e.preventDefault();
        onFiles(multiple ? files : files.slice(0, 1));
      } else {
        const text = e.clipboardData?.getData("text/plain") ?? "";
        if (text.trim().startsWith("<svg") || (text.includes("<svg") && text.trim().startsWith("<?xml"))) {
          e.preventDefault();
          onFiles([new File([text], "pasted.svg", { type: "image/svg+xml" })]);
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFiles, multiple]);

  const handle = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files);
      }}
      className={`rounded-xl border-2 border-dashed transition ${over ? "border-brand-500 bg-brand-50 dark:bg-brand-700/20" : "border-[var(--border)]"} ${compact ? "p-3" : "p-6"}`}
    >
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="file-input"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
      {compact ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="truncate text-[var(--muted)]" title={fileLabel}>{fileLabel}</span>
          <button type="button" onClick={() => input.current?.click()} className="shrink-0 rounded-md border border-[var(--border)] px-3 py-1.5 font-medium hover:border-brand-500">
            Replace file
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => input.current?.click()} className="flex w-full flex-col items-center gap-2 text-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-brand-600" aria-hidden="true">
            <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
          <span className="font-semibold">{title}</span>
          {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
          <span className="text-xs text-[var(--muted)]">Drop a file, click to browse, or paste (Ctrl/⌘ + V)</span>
        </button>
      )}
    </div>
  );
}
