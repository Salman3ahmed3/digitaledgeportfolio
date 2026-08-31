import * as React from "react";
import { Check, Minus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTAButton } from "@/components/shared/Button";
import { Reveal } from "@/components/shared/Reveal";

type Rating = "win" | "mid" | "lose";

interface Cell {
  rating: Rating;
  text: string;
}

const columns = [
  "Digital Edge",
  "In-House Team",
  "Freelancer",
  "Traditional Agency",
] as const;

// Each row: [Digital Edge, In-House, Freelancer, Agency]
const rows: { label: string; cells: Cell[] }[] = [
  {
    label: "Time to launch",
    cells: [
      { rating: "win", text: "Days" },
      { rating: "mid", text: "Weeks (hiring)" },
      { rating: "mid", text: "Varies" },
      { rating: "lose", text: "Weeks — months" },
    ],
  },
  {
    label: "Reporting transparency",
    cells: [
      { rating: "win", text: "Revenue-first, weekly" },
      { rating: "mid", text: "Depends on hire" },
      { rating: "lose", text: "Often ad-hoc" },
      { rating: "mid", text: "Vanity-heavy decks" },
    ],
  },
  {
    label: "Strategic depth",
    cells: [
      { rating: "win", text: "Full-funnel strategy" },
      { rating: "mid", text: "Limited bandwidth" },
      { rating: "lose", text: "Single-channel" },
      { rating: "mid", text: "Varies by pod" },
    ],
  },
  {
    label: "Cost efficiency",
    cells: [
      { rating: "win", text: "High value / spend" },
      { rating: "lose", text: "Salaries + overhead" },
      { rating: "mid", text: "Cheap, inconsistent" },
      { rating: "lose", text: "High retainers" },
    ],
  },
  {
    label: "Team seniority",
    cells: [
      { rating: "win", text: "Senior operators" },
      { rating: "mid", text: "1–2 generalists" },
      { rating: "mid", text: "One specialist" },
      { rating: "lose", text: "Junior account mgrs" },
    ],
  },
  {
    // The honest concession — freelancers/in-house genuinely win here.
    label: "Same-timezone availability",
    cells: [
      { rating: "mid", text: "Async-first, core hours" },
      { rating: "win", text: "Always in-house" },
      { rating: "win", text: "Can hire local" },
      { rating: "mid", text: "Varies" },
    ],
  },
  {
    label: "Contract flexibility",
    cells: [
      { rating: "win", text: "Month-to-month" },
      { rating: "lose", text: "Hire / fire cost" },
      { rating: "mid", text: "Project-based" },
      { rating: "lose", text: "6–12 mo lock-ins" },
    ],
  },
];

function RatingIcon({ rating }: { rating: Rating }) {
  if (rating === "win") {
    return (
      <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-100 text-brand-600">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  if (rating === "mid") {
    return (
      <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <Minus className="h-4 w-4" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-ink-100 text-ink-600">
      <X className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}

/**
 * Section 9 — Honest comparison table.
 * Digital Edge deliberately does NOT win every row: it concedes
 * "Same-timezone availability" to in-house teams and freelancers. That honest
 * tradeoff is what makes the rest of the table credible.
 */
export function Comparison() {
  return (
    <section className="bg-off-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Compare"
          title="How Digital Edge Compares"
          description="We're not the right fit for everything. Here's an honest look at where we win — and the one place we don't."
        />

        <Reveal className="mt-14 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-card">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-100">
                <th scope="col" className="p-5 text-sm font-600 text-ink-600">
                  <span className="sr-only">Criteria</span>
                </th>
                {columns.map((col, i) => (
                  <th
                    key={col}
                    scope="col"
                    className={cn(
                      "p-5 text-center font-display text-sm font-800 tracking-tight md:text-base",
                      i === 0
                        ? "rounded-t-xl bg-gradient-primary text-white"
                        : "text-navy-900",
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-ink-100 last:border-0",
                    rowIdx % 2 === 1 ? "bg-off-white/50" : "bg-white",
                  )}
                >
                  <th
                    scope="row"
                    className="p-5 align-top font-600 text-navy-900"
                  >
                    {row.label}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={cn(
                        "p-5 align-top",
                        i === 0 && "bg-brand-100/40",
                      )}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <RatingIcon rating={cell.rating} />
                        <span
                          className={cn(
                            "text-sm leading-snug",
                            i === 0
                              ? "font-600 text-navy-900"
                              : "text-ink-600",
                          )}
                        >
                          {cell.text}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <Reveal className="mt-6 text-center">
          <p className="mx-auto max-w-2xl text-sm text-ink-600">
            <span className="font-600 text-navy-900">Straight talk:</span> if you
            need someone physically in your timezone every hour of the day, an
            in-house hire or local freelancer may suit you better. For everything
            else — strategy, seniority, transparency, and flexibility — that&apos;s
            where we&apos;re built to win.
          </p>
        </Reveal>

        <Reveal className="mt-10 flex justify-center">
          <CTAButton
            label="See If We're the Right Fit"
            section="comparison"
            position="section-cta"
            variant="secondary"
            size="lg"
            href={site.bookingUrl}
            showArrow
          />
        </Reveal>
      </Container>
    </section>
  );
}
