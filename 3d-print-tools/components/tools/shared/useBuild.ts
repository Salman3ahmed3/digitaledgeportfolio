"use client";

import { useEffect, useRef, useState } from "react";
import type { Remote } from "comlink";
import type { GeometryApi } from "@/lib/workers/api";
import { runLatest } from "@/lib/workers/client";
import { workerError } from "@/lib/engines/errors";
import type { BuildResult } from "@/lib/engines/types";
import { track } from "@/lib/analytics";

/**
 * Debounced, cancellable rebuild. `job` is re-run whenever `deps` change
 * (after `delay` ms); stale results are dropped.
 */
export function useBuild<R extends BuildResult = BuildResult>(
  tool: string,
  job: ((api: Remote<GeometryApi>) => Promise<R>) | null,
  deps: unknown[],
  delay = 300,
) {
  const [result, setResult] = useState<R | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const jobRef = useRef(job);
  jobRef.current = job;

  useEffect(() => {
    const j = jobRef.current;
    if (!j) {
      setResult(null);
      setError("");
      return;
    }
    let alive = true;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const r = await runLatest(j);
        if (!alive || !r) return;
        setResult(r);
        setError("");
      } catch (e) {
        if (!alive) return;
        const { code, message } = workerError(e);
        setError(message);
        setResult(null);
        track("error", { tool, error_code: code });
      } finally {
        if (alive) setBusy(false);
      }
    }, delay);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { result, busy, error };
}
