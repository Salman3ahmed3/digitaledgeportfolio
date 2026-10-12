/**
 * Checks the static export in /out (run `npm run build` first; skipped otherwise):
 * one H1 per page, canonical + description + OG image, valid JSON-LD blocks,
 * sitemap covers every page, and no tool page links to a missing page.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TOOLS } from "@/content/tools";
import { GUIDES } from "@/content/guides";
import { absoluteUrl } from "@/site.config";

const OUT = join(__dirname, "../../out");
const built = existsSync(join(OUT, "index.html"));
const pages = [
  "index.html", "about.html", "contact.html", "privacy.html", "terms.html", "cookie-policy.html", "guides.html",
  ...TOOLS.map((t) => `${t.slug}.html`),
  ...GUIDES.map((g) => `guides/${g.slug}.html`),
];

const read = (p: string) => readFileSync(join(OUT, p), "utf8");
const ldBlocks = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

describe.skipIf(!built)("static export SEO", () => {
  for (const p of pages) {
    it(`${p}: head tags and a single H1`, () => {
      const html = read(p);
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
      expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+"/);
      expect(html).toMatch(/<meta name="description" content="[^"]{50,}"/);
      expect(html).toMatch(/<meta property="og:image" content="[^"]+\.png"/);
      expect(html).toMatch(/<html lang="en"/);
    });
  }

  for (const t of TOOLS) {
    it(`${t.slug}: JSON-LD is well-formed`, () => {
      const blocks = ldBlocks(read(`${t.slug}.html`));
      const types = blocks.map((b) => b["@type"]);
      expect(types).toEqual(expect.arrayContaining(["WebApplication", "BreadcrumbList", "FAQPage", "HowTo"]));
      for (const b of blocks) expect(b["@context"]).toBe("https://schema.org");
      const faq = blocks.find((b) => b["@type"] === "FAQPage");
      expect(faq.mainEntity.length).toBe(t.faq.length);
      for (const q of faq.mainEntity) {
        expect(q["@type"]).toBe("Question");
        expect(q.acceptedAnswer["@type"]).toBe("Answer");
        expect(q.acceptedAnswer.text.length).toBeGreaterThan(10);
      }
      const app = blocks.find((b) => b["@type"] === "WebApplication");
      expect(app.offers.price).toBe("0");
      expect(app.url).toBe(absoluteUrl(`/${t.slug}`));
      const crumbs = blocks.find((b) => b["@type"] === "BreadcrumbList");
      expect(crumbs.itemListElement.at(-1).item).toBe(absoluteUrl(`/${t.slug}`));
    });

    it(`${t.slug}: SEO copy is in the static HTML (no JS needed)`, () => {
      const html = read(`${t.slug}.html`);
      expect(html).toContain("How to use it");
      expect(html).toContain(t.faq[0].q.replace(/"/g, "&quot;").replace(/'/g, "&#x27;").slice(0, 20));
    });
  }

  it("internal links all resolve to exported pages", () => {
    const exists = (href: string) => href === "/" || existsSync(join(OUT, `${href.slice(1)}.html`)) || existsSync(join(OUT, href.slice(1)));
    for (const p of pages) {
      for (const m of read(p).matchAll(/href="(\/[^"#?]*)"/g)) {
        const href = m[1];
        if (href.startsWith("/_next/") || /\.(png|svg|ico|xml|txt)$/.test(href)) continue;
        expect(exists(href) ? href : `broken on ${p}: ${href}`).toBe(href);
      }
    }
  });

  it("sitemap lists every indexable page", () => {
    const xml = read("sitemap.xml");
    for (const t of TOOLS) expect(xml).toContain(`<loc>${absoluteUrl(`/${t.slug}`)}</loc>`);
    for (const g of GUIDES) expect(xml).toContain(`<loc>${absoluteUrl(`/guides/${g.slug}`)}</loc>`);
    expect(read("robots.txt")).toContain(`Sitemap: ${absoluteUrl("/sitemap.xml")}`);
  });
});
