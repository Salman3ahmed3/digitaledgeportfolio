import { describe, expect, it } from "vitest";
import { TOOLS } from "@/content/tools";
import { GUIDES } from "@/content/guides";

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

describe("tool content", () => {
  it("has unique slugs", () => {
    const slugs = TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  for (const t of TOOLS) {
    describe(t.slug, () => {
      it("meets the content brief", () => {
        const intro = words(t.intro.join(" "));
        expect(intro).toBeGreaterThanOrEqual(110);
        expect(intro).toBeLessThanOrEqual(230);
        expect(t.howTo.length).toBeGreaterThanOrEqual(4);
        expect(t.howTo.length).toBeLessThanOrEqual(5);
        expect(t.useCases.length).toBe(3);
        expect(t.faq.length).toBeGreaterThanOrEqual(6);
        expect(t.faq.length).toBeLessThanOrEqual(8);
        expect(t.metaDescription.length).toBeLessThanOrEqual(170);
        expect(t.title.length).toBeLessThanOrEqual(70);
      });

      it("only links to pages that exist", () => {
        const all = new Set(TOOLS.map((x) => x.slug));
        for (const s of [...t.related, ...(t.convertFrom ?? []), ...(t.convertTo ?? [])]) {
          expect(all.has(s) ? s : `missing: ${s}`).toBe(s);
        }
        expect(t.related).not.toContain(t.slug);
      });
    });
  }

  it("has no duplicate titles, H1s or descriptions", () => {
    for (const key of ["title", "h1", "metaDescription"] as const) {
      const v = TOOLS.map((t) => t[key]);
      expect(new Set(v).size).toBe(v.length);
    }
  });
});

describe("guides", () => {
  it("link to existing tools", () => {
    const all = new Set(TOOLS.map((x) => x.slug));
    for (const g of GUIDES) for (const s of g.relatedTools) expect(all.has(s) ? s : `missing: ${s}`).toBe(s);
  });
});
