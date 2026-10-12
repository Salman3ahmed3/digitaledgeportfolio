import type { MetadataRoute } from "next";
import { TOOLS } from "@/content/tools";
import { GUIDES } from "@/content/guides";
import { absoluteUrl } from "@/site.config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["/", "/guides", "/about", "/contact", "/privacy", "/terms", "/cookie-policy"];
  return [
    ...staticPages.map((p) => ({ url: absoluteUrl(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.3 })),
    ...TOOLS.map((t) => ({ url: absoluteUrl(`/${t.slug}`), lastModified: t.updated, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...GUIDES.map((g) => ({ url: absoluteUrl(`/guides/${g.slug}`), lastModified: g.updated, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
