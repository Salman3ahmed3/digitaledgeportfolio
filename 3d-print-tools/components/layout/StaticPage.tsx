import { Breadcrumbs } from "@/components/tool-page/Breadcrumbs";

export function StaticPage({ title, path, updated, children }: { title: string; path: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: title, path }]} />
      <article className="prose-tool">
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{title}</h1>
        {updated && <p className="text-sm text-[var(--muted)]">Last updated {updated}</p>}
        {children}
      </article>
    </div>
  );
}
