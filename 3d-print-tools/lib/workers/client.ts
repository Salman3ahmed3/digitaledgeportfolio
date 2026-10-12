import * as Comlink from "comlink";
import type { GeometryApi } from "./api";

let worker: Worker | null = null;
let remote: Comlink.Remote<GeometryApi> | null = null;

export function geometry(): Comlink.Remote<GeometryApi> {
  if (!remote) {
    worker = new Worker(new URL("./geometry.worker.ts", import.meta.url), { type: "module" });
    remote = Comlink.wrap<GeometryApi>(worker);
  }
  return remote;
}

/** Kill the worker (cancels any in-flight job). The next call starts a fresh one. */
export function resetGeometry() {
  worker?.terminate();
  worker = null;
  if (remote) remote[Comlink.releaseProxy]();
  remote = null;
}

let busy = 0;
/**
 * "Latest wins" runner for preview rebuilds: if a previous job is still
 * running it is cancelled by restarting the worker, so the UI never waits for
 * stale work. Rejected (cancelled) jobs resolve to null.
 */
export async function runLatest<T>(job: (api: Comlink.Remote<GeometryApi>) => Promise<T>): Promise<T | null> {
  const id = ++busy;
  if (id > 1 && inFlight) resetGeometry();
  inFlight = true;
  try {
    const result = await job(geometry());
    return id === busy ? result : null;
  } catch (e) {
    if (id !== busy) return null;
    throw e;
  } finally {
    if (id === busy) inFlight = false;
  }
}
let inFlight = false;

export { Comlink };
