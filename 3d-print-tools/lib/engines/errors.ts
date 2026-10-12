/** Decode an error thrown by the geometry worker into a user-facing message + code. */
export function workerError(e: unknown): { code: string; message: string } {
  const msg = e instanceof Error ? e.message : String(e);
  const m = /USER:([a-z_]+):(.*)$/s.exec(msg);
  if (m) return { code: m[1], message: m[2] };
  if (/memory|allocation|Aborted/i.test(msg)) {
    return { code: "out_of_memory", message: "Your browser ran out of memory building this model. Try a lower resolution or a smaller image." };
  }
  return { code: "build_failed", message: "Something went wrong building the model. Try different settings or another file." };
}
