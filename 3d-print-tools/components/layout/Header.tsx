import Link from "next/link";
import { TOOLS } from "@/content/tools";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const GROUPS = [
  { key: "make", label: "Make" },
  { key: "convert", label: "Convert" },
  { key: "view", label: "View" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="shrink-0" aria-label="Home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center gap-1 text-sm">
          {/* <details> keeps the menu usable without JavaScript. */}
          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-md px-3 py-2 font-medium hover:bg-black/5 dark:hover:bg-white/10 [&::-webkit-details-marker]:hidden">
              Tools <span aria-hidden="true">▾</span>
            </summary>
            <div className="absolute right-0 mt-2 grid w-[min(92vw,640px)] grid-cols-1 gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl sm:grid-cols-3">
              {GROUPS.map((g) => (
                <div key={g.key}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{g.label}</p>
                  <ul className="space-y-1">
                    {TOOLS.filter((t) => t.category === g.key).map((t) => (
                      <li key={t.slug}>
                        <Link href={`/${t.slug}`} className="block rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
                          {t.shortName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
          <Link href="/guides" className="rounded-md px-3 py-2 font-medium hover:bg-black/5 dark:hover:bg-white/10">
            Guides
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
