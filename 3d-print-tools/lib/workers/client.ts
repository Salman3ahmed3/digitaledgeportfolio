import * as Comlink from "comlink";
import type { GeometryApi } from "./api";

type Handle = { worker: Worker; remote: Comlink.Remote<GeometryApi> };

function spawn(): Handle {
  const worker = new Worker(new URL("./geometry.worker.ts", import.meta.url), { type: "module" });
  return { worker, remote: Comlink.wrap<GeometryApi>(worker) };
}

// Two workers: `main` handles parsing, analysis and exports and is never
// restarted; `builder` runs preview rebuilds and may be killed to cancel one.
let main: Handle | null = null;
let builder: Handle | null = null;

/** Worker for one-off jobs (parse, analyze, export). Never cancelled. */
export function geometry(): Comlink.Remote<GeometryApi> {
  main ??= spawn();
  return main.remote;
}

function resetBuilder() {
  if (!builder) return;
  builder.worker.terminate();
  builder.remote[Comlink.releaseProxy]();
  builder = null;
}

let latest = 0;
let inFlight = false;
/**
 * "Latest wins" runner for preview rebuilds: if a previous build is still
 * running it is cancelled by restarting the build worker, so the UI never
 * waits for stale work. Superseded jobs resolve to null.
 */
export async function runLatest<T>(job: (api: Comlink.Remote<GeometryApi>) => Promise<T>): Promise<T | null> {
  const id = ++latest;
  if (inFlight) resetBuilder();
  inFlight = true;
  builder ??= spawn();
  try {
    const result = await job(builder.remote);
    return id === latest ? result : null;
  } catch (e) {
    if (id !== latest) return null;
    throw e;
  } finally {
    if (id === latest) inFlight = false;
  }
}

export { Comlink };
