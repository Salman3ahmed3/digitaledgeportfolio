import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTAButton } from "@/components/shared/Button";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/Reveal";

/**
 * Section 11 — Transparent pricing.
 *
 * TODO(user): CONFIRM ACTUAL PRICING before launch. The dollar amounts below
 * are placeholders shown as "starts from" anchors (transparency beats hiding
 * pricing) — replace them with your real numbers, or set to "Custom" if you
 * quote per engagement. Ideal-for / inclusions are editable per tier.
 */
const tiers = [
  {
    name: "Growth Sprint",
    // TODO(user): confirm real starting price
    price: "$1,500",
    period: "/mo",
    idealFor: "For early-stage brands ready to test paid channels",
    features: [
      "1 primary paid channel (Meta or Google)",
      "Campaign build + creative testing",
      "Conversion tracking & pixel setup",
      "Bi-weekly performance reporting",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Scale Partner",
    // TODO(user): confirm real starting price
    price: "$4,000",
    period: "/mo",
    idealFor: "For growing brands doing $50k–$500k/mo revenue",
    features: [
      "Meta + Google Ads fully managed",
      "Full-funnel landing pages + CRO",
      "Email / SMS automation flows",
      "Weekly reporting + monthly strategy calls",
      "Dedicated senior strategist",
      "Ongoing creative production",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    idealFor: "For established brands needing full-funnel scale",
    features: [
      "Everything in Scale Partner",
      "Multi-brand / multi-market management",
      "Advanced attribution + data warehouse",
      "Custom executive dashboards",
      "Quarterly business reviews",
      "Priority Slack access",
    ],
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Transparent pricing, no lock-ins"
          description="Real starting anchors — not a “contact us” black box. Every plan is month-to-month."
        />

        <RevealGroup className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <RevealItem
              key={tier.name}
              as="article"
              className={cn(
                "relative flex h-full flex-col rounded-2xl border bg-white p-7 transition-all duration-300",
                tier.popular
                  ? "border-brand-600 shadow-card-hover lg:-translate-y-3 lg:scale-[1.02]"
                  : "border-ink-100 shadow-card hover:-translate-y-1 hover:shadow-card-hover",
              )}
            >
              {tier.popular ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="popular">Most Popular</Badge>
                </div>
              ) : null}

              <h3 className="font-display text-xl font-800 tracking-tight text-navy-900">
                {tier.name}
              </h3>
              <p className="mt-2 min-h-[2.5rem] text-sm leading-relaxed text-ink-600">
                {tier.idealFor}
              </p>

              <div className="mt-5 flex items-end gap-1">
                {tier.price !== "Custom" ? (
                  <span className="pb-1 text-sm font-600 text-ink-600">
                    from
                  </span>
                ) : null}
                <span className="font-display text-4xl font-800 tracking-tightest text-navy-900">
                  {tier.price}
                </span>
                <span className="pb-1.5 text-base font-600 text-ink-600">
                  {tier.period}
                </span>
              </div>
              {/* TODO(user): remove this placeholder note once pricing is confirmed */}
              <p className="mt-1 text-xs italic text-ink-600/80">
                Indicative — confirmed on your discovery call
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-100 text-brand-600">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-navy-900">{feature}</span>
                  </li>
                ))}
              </ul>

              <CTAButton
                label="Book Discovery Call"
                section="pricing"
                position={`pricing-${tier.name.toLowerCase().replace(/\s+/g, "-")}`}
                variant={tier.popular ? "primary" : "secondary"}
                href={site.bookingUrl}
                className="mt-7 w-full"
              />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-8 text-center">
          <p className="text-sm font-600 text-navy-900">
            All plans month-to-month.{" "}
            <span className="text-ink-600">No 6-month lock-ins.</span>
          </p>
        </Reveal>

        <Reveal className="mt-8 flex justify-center">
          <CTAButton
            label="Not Sure Which Plan? Let's Talk"
            section="pricing"
            position="section-cta"
            variant="ghost"
            size="lg"
            href={site.bookingUrl}
            showArrow
          />
        </Reveal>
      </Container>
    </section>
  );
}
