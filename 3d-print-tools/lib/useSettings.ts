"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadJson, saveJson } from "./storage";

/**
 * Tool settings state: defaults ← page preset ← last-used values (localStorage).
 * Values listed in `presetLocked` always come from the preset (e.g. the mode on
 * a keychain page) so a saved setting from another page can't override it.
 */
export function useSettings<T extends object>(key: string, defaults: T, preset: Partial<T> = {}, presetLocked: (keyof T)[] = []) {
  const initial = useRef<T>({ ...defaults, ...preset });
  const [settings, setSettings] = useState<T>(initial.current);
  const loaded = useRef(false);

  useEffect(() => {
    const saved = loadJson<T>(key);
    if (saved) {
      const merged = { ...initial.current } as T;
      for (const k of Object.keys(defaults) as (keyof T)[]) {
        if (k in saved && !presetLocked.includes(k) && typeof saved[k] === typeof defaults[k]) merged[k] = saved[k] as T[keyof T];
      }
      setSettings(merged);
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (loaded.current) saveJson(key, settings);
  }, [key, settings]);

  const update = useCallback(<K extends keyof T>(k: K, v: T[K]) => setSettings((s) => ({ ...s, [k]: v })), []);
  const reset = useCallback(() => setSettings(initial.current), []);
  return { settings, update, reset, setSettings };
}

export function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
