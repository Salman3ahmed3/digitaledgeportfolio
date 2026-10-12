import type { Part } from "../mesh";

const fmt = (n: number) => (Math.round(n * 1e5) / 1e5).toString();

/** Wavefront OBJ, one `o` per part, 1-based shared vertex numbering. */
export function toObj(parts: Part[]): string {
  const out: string[] = ["# Units: millimetres"];
  let base = 1;
  for (const part of parts) {
    const { positions: p, indices: idx } = part.mesh;
    out.push(`o ${part.name.replace(/\s+/g, "_") || "part"}`);
    for (let i = 0; i < p.length; i += 3) out.push(`v ${fmt(p[i])} ${fmt(p[i + 1])} ${fmt(p[i + 2])}`);
    for (let t = 0; t < idx.length; t += 3) out.push(`f ${idx[t] + base} ${idx[t + 1] + base} ${idx[t + 2] + base}`);
    base += p.length / 3;
  }
  return out.join("\n") + "\n";
}
