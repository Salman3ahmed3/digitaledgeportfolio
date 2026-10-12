import type { ToolPage } from "@/content/types";
import { AdSlot } from "@/components/ads/AdSlot";
import { ToolMount } from "@/components/tools/ToolMount";
import { Breadcrumbs } from "./Breadcrumbs";
import { Faq } from "./Faq";
import { RelatedTools } from "./RelatedTools";
import { TrustChips } from "./TrustChips";

export function ToolPageLayout({ tool }: { tool: ToolPage }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: tool.shortName, path: `/${tool.slug}` }]} />
      <header className="mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{tool.h1}</h1>
        <p className="mt-2 max-w-3xl text-lg text-[var(--muted)]">{tool.valueLine}</p>
        <TrustChips />
      </header>

      <section aria-label="Tool" className="mt-6">
        <ToolMount slug={tool.slug} engine={tool.engine} preset={tool.preset} defaultFormat={tool.defaultFormat} />
      </section>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
        <article className="prose-tool min-w-0 max-w-3xl">
          <section aria-labelledby="about-tool">
            <h2 id="about-tool">About this tool</h2>
            {tool.intro.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </section>

          <AdSlot slot="belowTool" format="responsive" />

          <section aria-labelledby="how-to">
            <h2 id="how-to">How to use it</h2>
            <ol>
              {tool.howTo.map((s) => (
                <li key={s.name}>
                  <strong>{s.name}.</strong> {s.text}
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="settings">
            <h2 id="settings">Settings explained</h2>
            <dl className="space-y-3">
              {tool.settings.map((s) => (
                <div key={s.name}>
                  <dt className="font-semibold">{s.name}</dt>
                  <dd className="text-[var(--muted)]">{s.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <AdSlot slot="inContent" format="in-content" />

          <section aria-labelledby="examples">
            <h2 id="examples">Example uses</h2>
            <div className="not-prose grid gap-4 sm:grid-cols-3">
              {tool.useCases.map((u) => (
                <div key={u.title} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <h3 className="font-semibold">{u.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{u.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="print-tips">
            <h2 id="print-tips">Print tips</h2>
            <ul>
              {tool.printTips.map((t) => (
                <li key={t.slice(0, 40)}>{t}</li>
              ))}
            </ul>
          </section>

          <AdSlot slot="inContent" format="in-content" />

          <Faq items={tool.faq} />
          <RelatedTools tool={tool} />
        </article>
        <aside className="hidden xl:block" aria-label="Sidebar">
          <div className="sticky top-20">
            <AdSlot slot="sidebar" format="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
