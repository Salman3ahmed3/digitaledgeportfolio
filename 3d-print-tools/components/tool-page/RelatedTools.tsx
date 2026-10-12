import Link from "next/link";
import { toolBySlug } from "@/content/tools";
import type { ToolPage } from "@/content/types";
import { ToolCard } from "./ToolCard";

const resolve = (slugs: string[] = []) => slugs.map(toolBySlug).filter((t): t is ToolPage => !!t);

export function RelatedTools({ tool }: { tool: ToolPage }) {
  const related = resolve(tool.related).slice(0, 6);
  const from = resolve(tool.convertFrom);
  const to = resolve(tool.convertTo);
  return (
    <section aria-labelledby="related">
      <h2 id="related">Related tools</h2>
      <div className="not-prose grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
      {(from.length > 0 || to.length > 0) && (
        <div className="not-prose mt-6 grid gap-6 sm:grid-cols-2">
          {from.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Convert from</h3>
              <ul className="flex flex-wrap gap-2">
                {from.map((t) => (
                  <li key={t.slug}>
                    <Link className="inline-block rounded-md border border-[var(--border)] px-3 py-1 text-sm hover:border-brand-500" href={`/${t.slug}`}>
                      {t.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {to.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold">Convert to</h3>
              <ul className="flex flex-wrap gap-2">
                {to.map((t) => (
                  <li key={t.slug}>
                    <Link className="inline-block rounded-md border border-[var(--border)] px-3 py-1 text-sm hover:border-brand-500" href={`/${t.slug}`}>
                      {t.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
