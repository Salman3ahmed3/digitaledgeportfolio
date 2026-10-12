import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/tool-page/Breadcrumbs";

export const metadata = pageMetadata({
  title: "3D Printing Guides",
  description: "Practical guides for lithophanes, preparing SVG and image files for 3D printing, and fixing STL problems.",
  path: "/guides",
});

export default function GuidesIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }]} />
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">3D printing guides</h1>
      <p className="mt-2 text-[var(--muted)]">Short, practical write-ups to get better prints from the tools on this site.</p>
      <ul className="mt-8 space-y-4">
        {GUIDES.map((g) => (
          <li key={g.slug} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <Link href={`/guides/${g.slug}`} className="text-lg font-semibold hover:underline">{g.h1}</Link>
            <p className="mt-1 text-sm text-[var(--muted)]">{g.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
