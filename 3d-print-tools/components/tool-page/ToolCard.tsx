import Link from "next/link";
import type { ToolPage } from "@/content/types";

export function ToolCard({ tool }: { tool: ToolPage }) {
  return (
    <Link
      href={`/${tool.slug}`}
      className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-brand-500 hover:shadow-md"
    >
      <p className="font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-100">{tool.shortName}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{tool.cardText}</p>
    </Link>
  );
}
