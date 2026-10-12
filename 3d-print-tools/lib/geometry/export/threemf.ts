import { zipSync, strToU8 } from "fflate";
import type { Part } from "../mesh";

const fmt = (n: number) => (Math.round(n * 1e5) / 1e5).toString();
const esc = (s: string) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** 3MF (zipped XML). One object per part, millimetres, optional colours. */
export function to3mf(parts: Part[]): Uint8Array {
  const colors = parts.map((p) => (/^#[0-9a-f]{6}$/i.test(p.color ?? "") ? p.color!.toUpperCase() : null));
  const hasColor = colors.some(Boolean);
  const res: string[] = [];
  if (hasColor) {
    res.push(`<basematerials id="1">`);
    colors.forEach((c, i) => res.push(`<base name="${esc(parts[i].name)}" displaycolor="${c ?? "#CCCCCC"}"/>`));
    res.push(`</basematerials>`);
  }
  parts.forEach((part, i) => {
    const id = i + 2;
    const { positions: p, indices: idx } = part.mesh;
    const mat = hasColor ? ` pid="1" pindex="${i}"` : "";
    const v: string[] = [];
    for (let k = 0; k < p.length; k += 3) v.push(`<vertex x="${fmt(p[k])}" y="${fmt(p[k + 1])}" z="${fmt(p[k + 2])}"/>`);
    const t: string[] = [];
    for (let k = 0; k < idx.length; k += 3) t.push(`<triangle v1="${idx[k]}" v2="${idx[k + 1]}" v3="${idx[k + 2]}"/>`);
    res.push(
      `<object id="${id}" name="${esc(part.name)}" type="model"${mat}><mesh><vertices>${v.join("")}</vertices><triangles>${t.join("")}</triangles></mesh></object>`,
    );
  });
  const items = parts.map((_, i) => `<item objectid="${i + 2}"/>`).join("");
  const model =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">` +
    `<resources>${res.join("")}</resources><build>${items}</build></model>`;
  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>`;
  const rels =
    `<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>`;
  return zipSync({
    "[Content_Types].xml": strToU8(contentTypes),
    "_rels/.rels": strToU8(rels),
    "3D/3dmodel.model": strToU8(model),
  });
}
