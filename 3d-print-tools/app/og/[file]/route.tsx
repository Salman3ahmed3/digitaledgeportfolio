import { renderOg } from "@/lib/og/render";
import { TOOLS } from "@/content/tools";
import { GUIDES } from "@/content/guides";

// Build-time OG images, emitted as real .png files so any static host serves
// them with the right content type: /og/<tool-slug>.png, /og/guide-<slug>.png, /og/home.png
export const dynamic = "force-static";
export const dynamicParams = false;

const IMAGES: Record<string, [string, string]> = {
  "home.png": ["3D printing tools in your browser", "Image to STL · SVG to STL · Lithophanes · STL viewer"],
  ...Object.fromEntries(TOOLS.map((t) => [`${t.slug}.png`, [t.h1, t.valueLine]])),
  ...Object.fromEntries(GUIDES.map((g) => [`guide-${g.slug}.png`, [g.h1, "3D printing guide"]])),
};

export function generateStaticParams() {
  return Object.keys(IMAGES).map((file) => ({ file }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const [title, subtitle] = IMAGES[(await params).file];
  return renderOg(title, subtitle);
}
