import * as React from "react";
import { BarChart3, Wallet, SearchX } from "lucide-react";

import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/Reveal";

const pains = [
  {
    icon: BarChart3,
    title: "Reports full of impressions & reach — but zero revenue clarity",
    body: "You get dashboards packed with numbers that don't answer the only question that matters: did this make money?",
  },
  {
    icon: Wallet,
    title: "Ad accounts quietly leaking spend on the wrong audiences",
    body: "Budget bleeds into broad targeting and stale creative while nobody's watching the metrics that actually move profit.",
  },
  {
    icon: SearchX,
    title: "SEO work with no traffic, no rankings, no accountability",
    body: "Months of \"content\" and \"optimization\" with nothing to show — and no clear line from the work to the results.",
  },
];

/**
 * Section 5 — Problem / Agitate.
 */
export function Problem() {
  return (
    <section className="bg-off-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="The Problem"
          title="Tired of marketing that looks busy but doesn't produce?"
          description="Most agencies optimize for activity, not outcomes. You feel it every time a report lands and revenue hasn't moved."
        />

        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {pains.map((pain) => (
            <RevealItem
              key={pain.title}
              as="article"
              className="group flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <pain.icon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-lg font-700 leading-snug text-navy-900">
                {pain.title}
              </h3>
              <p className="text-base leading-relaxed text-ink-600">
                {pain.body}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-14 text-center">
          <p className="font-display text-2xl font-800 tracking-tightest text-navy-900 md:text-3xl">
            Digital Edge fixes that.{" "}
            <span className="bg-gradient-cta bg-clip-text text-transparent">
              Here&apos;s how.
            </span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
