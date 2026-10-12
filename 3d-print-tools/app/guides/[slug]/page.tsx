import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, guideBySlug } from "@/content/guides";
import { toolBySlug } from "@/content/tools";
import { articleLd, breadcrumbLd, faqLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/tool-page/Breadcrumbs";
import { Faq } from "@/components/tool-page/Faq";
import { ToolCard } from "@/components/tool-page/ToolCard";
import { AdSlot } from "@/components/ads/AdSlot";

export const dynamicParams = false;
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return pageMetadata({ title: g.title, description: g.metaDescription, path: `/guides/${g.slug}`, ogImage: `/og/guide-${g.slug}.png` });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const path = `/guides/${g.slug}`;
  const tools = g.relatedTools.map(toolBySlug).filter((t) => !!t);
  const adAfter = Math.min(2, g.sections.length - 1);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <JsonLd
        data={[
          articleLd({ title: g.h1, description: g.metaDescription, path, updated: g.updated }),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: g.h1, path }]),
          ...(g.faq?.length ? [faqLd(g.faq)] : []),
        ]}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: g.h1, path }]} />
      <article className="prose-tool">
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{g.h1}</h1>
        <p className="text-lg text-[var(--muted)]">{g.summary}</p>
        <p className="text-sm text-[var(--muted)]">Last updated {g.updated}</p>
        {g.sections.map((s, i) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 50)}>{p}</p>
            ))}
            {s.list && (
              <ul>
                {s.list.map((l) => (
                  <li key={l.slice(0, 50)}>{l}</li>
                ))}
              </ul>
            )}
            {s.table && (
              <table>
                <thead>
                  <tr>{s.table[0].map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {s.table.slice(1).map((r) => (
                    <tr key={r.join("|")}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            )}
            {i === adAfter && <AdSlot slot="inContent" format="in-content" />}
          </section>
        ))}
        {g.faq && <Faq items={g.faq} />}
        {tools.length > 0 && (
          <section>
            <h2>Tools for this guide</h2>
            <div className="not-prose grid gap-3 sm:grid-cols-2">
              {tools.map((t) => <ToolCard key={t!.slug} tool={t!} />)}
            </div>
          </section>
        )}
        <p><Link href="/guides">← All guides</Link></p>
      </article>
    </div>
  );
}
