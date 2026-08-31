import * as React from "react";
import { Megaphone, Search, ShoppingCart, Workflow, ArrowRight } from "lucide-react";

import { site } from "@/lib/site";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTAButton } from "@/components/shared/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/Reveal";

const services = [
  {
    icon: Megaphone,
    name: "Meta & Google Ads",
    outcome: "Profitable paid campaigns with full-funnel tracking.",
  },
  {
    icon: Search,
    name: "SEO & Content",
    outcome: "Ranking for keywords that actually convert to revenue.",
  },
  {
    icon: ShoppingCart,
    name: "Shopify / E-com CRO",
    outcome: "Higher AOV, better checkout conversion, retention flows.",
  },
  {
    icon: Workflow,
    name: "Full-Funnel Systems",
    outcome: "Landing pages, email automation, CRM, and attribution.",
  },
];

/**
 * Section 6 — Services (4-card grid).
 */
export function Services() {
  return (
    <section id="services" className="scroll-mt-24 bg-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="What We Do"
          title="Full-funnel marketing, run by senior operators"
          description="Every channel wired to one goal: trackable revenue. Pick a single lever or let us run the whole system."
        />

        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <RevealItem
              key={service.name}
              as="article"
              className="group flex h-full flex-col gap-4 rounded-2xl border border-ink-100 bg-off-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-600/30 hover:shadow-card-hover"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta text-white shadow-cta">
                <service.icon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-xl font-700 tracking-tight text-navy-900">
                {service.name}
              </h3>
              <p className="flex-1 text-base leading-relaxed text-ink-600">
                {service.outcome}
              </p>
              <a
                href={site.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-600 text-brand-600 transition-colors hover:text-brand-500"
              >
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-14 flex justify-center">
          <CTAButton
            label="Talk to Us About Your Growth Plan"
            section="services"
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
