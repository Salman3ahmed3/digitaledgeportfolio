/** Tiny MTL reader: material name → sRGB hex from `Kd`. */
export function parseMtlColors(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  let current = "";
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("newmtl ")) current = line.slice(7).trim();
    else if (line.startsWith("Kd ") && current) {
      const [r, g, b] = line.slice(3).trim().split(/\s+/).map(Number);
      const hex = (v: number) => Math.round(Math.min(1, Math.max(0, v || 0)) * 255).toString(16).padStart(2, "0");
      out[current] = `#${hex(r)}${hex(g)}${hex(b)}`;
    }
  }
  return out;
}
