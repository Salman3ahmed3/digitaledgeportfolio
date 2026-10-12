"use client";

import { useEffect, useId, useState } from "react";
import { useUnits } from "./units";

const labelCls = "text-sm font-medium";
const hintCls = "mt-1 text-xs text-[var(--muted)]";

export function Group({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b border-[var(--border)] py-3 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="text-[var(--muted)] transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="mt-3 space-y-4">{children}</div>
    </details>
  );
}

/**
 * Slider + number input. `length` fields are stored in mm and shown in the
 * user's chosen unit.
 */
export function NumberField({
  label, value, onChange, min, max, step = 1, length = false, suffix, hint, disabled,
}: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number;
  length?: boolean; suffix?: string; hint?: string; disabled?: boolean;
}) {
  const id = useId();
  const { units } = useUnits();
  const k = length && units === "in" ? 1 / 25.4 : 1;
  const unitLabel = length ? units : suffix;
  const decimals = Math.max(0, -Math.floor(Math.log10(step * k)) + (k !== 1 ? 1 : 0));
  const shown = +(value * k).toFixed(decimals);
  const [text, setText] = useState(String(shown));
  useEffect(() => setText(String(shown)), [shown]);
  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return setText(String(shown));
    const v = Math.min(max, Math.max(min, n / k));
    if (Math.abs(v - value) > 1e-9) onChange(v); // blur after Enter shouldn't trigger a rebuild
    else setText(String(shown));
  };
  return (
    <div className={disabled ? "opacity-50" : ""}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={labelCls}>{label}</label>
        <span className="flex items-center gap-1">
          <input
            type="number"
            inputMode="decimal"
            aria-label={`${label} value`}
            className="w-20 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-right text-sm tabular-nums"
            value={text}
            step={step * k}
            min={min * k}
            max={max * k}
            disabled={disabled}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit((e.target as HTMLInputElement).value)}
          />
          {unitLabel && <span className="w-6 text-xs text-[var(--muted)]">{unitLabel}</span>}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="mt-2 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

export function SelectField<T extends string | number>({
  label, value, onChange, options, hint,
}: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={`${labelCls} block`}>{label}</label>
      <select
        id={id}
        className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-sm"
        value={String(value)}
        onChange={(e) => {
          const o = options.find((x) => String(x.value) === e.target.value);
          if (o) onChange(o.value);
        }}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
        ))}
      </select>
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

/** Segmented control for 2–4 short options. */
export function Segmented<T extends string>({
  label, value, onChange, options,
}: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div>
      <p className={labelCls} id={`${label}-seg`}>{label}</p>
      <div role="radiogroup" aria-labelledby={`${label}-seg`} className="mt-1 grid gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md px-2 py-1.5 text-xs font-medium ${value === o.value ? "bg-[var(--surface)] shadow" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className={labelCls}>{label}</label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-600"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
      {hint && <p className={hintCls}>{hint}</p>}
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className={labelCls}>{label}</label>
      <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-12 cursor-pointer rounded border border-[var(--border)] bg-transparent" />
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  const id = useId();
  const cls = "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-sm";
  return (
    <div>
      <label htmlFor={id} className={`${labelCls} block`}>{label}</label>
      {multiline ? (
        <textarea id={id} rows={2} className={cls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} type="text" className={cls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
