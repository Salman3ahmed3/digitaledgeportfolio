"use client";

import { UnitsToggle } from "@/components/ui/units";

/**
 * Tool layout.
 * Desktop: left column = input, settings, download; right = 3D preview.
 * Mobile: input → preview → download → settings, so the result is visible
 * without scrolling past every control.
 */
export function ToolShell({
  input, controls, actions, preview, onReset,
}: {
  input: React.ReactNode; controls: React.ReactNode; actions: React.ReactNode; preview: React.ReactNode; onReset?: () => void;
}) {
  return (
      <div className="tool-grid rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm sm:p-4">
        <div className="ta-input min-w-0">{input}</div>
        <div className="ta-preview min-w-0">{preview}</div>
        <div className="ta-actions min-w-0">{actions}</div>
        <div className="ta-controls min-w-0 lg:max-h-[520px] lg:overflow-y-auto lg:pr-1">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="text-sm font-semibold">Settings</span>
            <span className="flex items-center gap-3">
              <UnitsToggle />
              {onReset && (
                <button type="button" onClick={onReset} className="text-xs font-medium text-[var(--muted)] underline hover:text-[var(--text)]">
                  Reset
                </button>
              )}
            </span>
          </div>
          {controls}
        </div>
      </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
      {children}
    </p>
  );
}
