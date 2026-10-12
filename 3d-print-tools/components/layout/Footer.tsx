import Link from "next/link";
import { TOOLS } from "@/content/tools";
import { GUIDES } from "@/content/guides";
import { SITE } from "@/site.config";
import { Logo } from "./Logo";

export function Footer() {
  const cols = [
    { title: "Make", items: TOOLS.filter((t) => t.category === "make") },
    { title: "Convert", items: TOOLS.filter((t) => t.category === "convert") },
    { title: "View", items: TOOLS.filter((t) => t.category === "view") },
  ];
  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-[var(--muted)]">
            Free 3D printing tools that run entirely in your browser. Your files never leave your device.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="mb-3 text-sm font-semibold">{c.title}</p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {c.items.map((t) => (
                <li key={t.slug}>
                  <Link className="hover:text-[var(--text)] hover:underline" href={`/${t.slug}`}>
                    {t.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="mb-3 text-sm font-semibold">Guides &amp; info</p>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            {GUIDES.slice(0, 4).map((g) => (
              <li key={g.slug}>
                <Link className="hover:text-[var(--text)] hover:underline" href={`/guides/${g.slug}`}>
                  {g.h1}
                </Link>
              </li>
            ))}
            <li><Link className="hover:text-[var(--text)] hover:underline" href="/about">About</Link></li>
            <li><Link className="hover:text-[var(--text)] hover:underline" href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-xs text-[var(--muted)]">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <Link className="hover:underline" href="/privacy">Privacy</Link>
          <Link className="hover:underline" href="/terms">Terms</Link>
          <Link className="hover:underline" href="/cookie-policy">Cookie policy</Link>
          <span className="ml-auto">Fonts: Inter, Bebas Neue, Pacifico (SIL OFL 1.1)</span>
        </div>
      </div>
    </footer>
  );
}
