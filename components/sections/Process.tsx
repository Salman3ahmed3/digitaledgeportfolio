import * as React from "react";

import { site } from "@/lib/site";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTAButton } from "@/components/shared/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/Reveal";

const steps = [
  {
    num: "01",
    title: "Audit",
    short: "Free 30-min deep-dive into your current marketing.",
    detail:
      "We pull your ad accounts, analytics, and funnel apart to find the top 3 revenue leaks — and hand you the findings whether we work together or not.",
  },
  {
    num: "02",
    title: "Strategy",
    short: "Custom roadmap with KPIs, budgets, and a 90-day plan.",
    detail:
      "You get a clear channel mix, spend allocation, forecast, and the exact metrics we'll be accountable to — no vague deliverables.",
  },
  {
    num: "03",
    title: "Execute",
    short: "Our senior team runs campaigns, builds pages, writes copy.",
    detail:
      "Real operators — not junior account managers — build and ship. Campaigns, landing pages, creative, email flows, and tracking, done right.",
  },
  {
    num: "04",
    title: "Scale",
    short: "Weekly reporting, monthly reviews, quarterly scale plans.",
    detail:
      "We double down on what's working, cut what isn't, and reinvest into the highest-ROI channels — with revenue-first reporting every week.",
  },
];

/**
 * Section 7 — The Digital Edge Process.
 * Horizontal 4-step timeline (stacks on mobile). Each node hover-expands to
 * reveal deeper detail on desktop; on mobile the detail is always visible.
 */
export function Process() {
  return (
    <section id="process" className="scroll-mt-24 bg-off-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="How It Works"
          title="The Digital Edge Process"
          description="A simple, accountable path from audit to scale — you always know what's happening and why."
        />

        <RevealGroup className="mt-16 grid gap-6 md:grid-cols-4 md:gap-4">
          {steps.map((step, i) => (
            <RevealItem
              key={step.num}
              as="article"
              className="group relative flex flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-11 hidden h-px w-4 translate-x-full bg-gradient-to-r from-brand-500/60 to-transparent md:block"
                />
              ) : null}

              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 font-display text-lg font-800 text-brand-100 transition-colors group-hover:bg-gradient-cta group-hover:text-white">
                {step.num}
              </span>
              <h3 className="mt-5 font-display text-xl font-700 tracking-tight text-navy-900">
                {step.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-ink-600">
                {step.short}
              </p>

              {/* Hover-expand detail (always visible on mobile) */}
              <div className="grid transition-all duration-300 md:grid-rows-[0fr] md:opacity-0 md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100 md:group-focus-within:grid-rows-[1fr] md:group-focus-within:opacity-100">
                <div className="overflow-hidden">
                  <p className="pt-3 text-sm leading-relaxed text-ink-600">
                    {step.detail}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-14 flex justify-center">
          <CTAButton
            label="See If Our Process Fits Your Business"
            section="process"
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
