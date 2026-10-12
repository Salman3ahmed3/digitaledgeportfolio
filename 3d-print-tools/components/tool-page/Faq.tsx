import type { QA } from "@/content/types";

export function Faq({ items, heading = "Frequently asked questions" }: { items: QA[]; heading?: string }) {
  return (
    <section aria-labelledby="faq">
      <h2 id="faq">{heading}</h2>
      <div className="not-prose divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        {items.map((f) => (
          <details key={f.q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              <h3 className="text-base font-medium">{f.q}</h3>
              <span aria-hidden="true" className="mt-0.5 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-[var(--muted)]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
