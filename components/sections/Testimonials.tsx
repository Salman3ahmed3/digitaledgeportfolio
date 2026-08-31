import * as React from "react";
import { Star, Quote } from "lucide-react";

import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { RevealGroup, RevealItem } from "@/components/shared/Reveal";

/**
 * Section 10 — Testimonials.
 * Static grid by design — NO auto-looping marquee (see brief anti-patterns).
 *
 * TODO(user): Replace with real, attributed testimonials. Each quote should
 * include a specific metric. Drop client photos in /public/images/testimonials/
 * and render the circle avatar with next/image instead of the initials fallback.
 */
const testimonials = [
  {
    name: "Jane Doe",
    role: "Founder & CEO",
    company: "Acme Skincare",
    industry: "DTC E-commerce",
    initials: "JD",
    quote:
      "Within the first quarter our ROAS went from 1.6x to 3.4x and we finally understood which campaigns were actually driving revenue. The reporting is the clearest we've ever had. It feels like having a senior growth lead in-house — without the overhead.",
  },
  {
    name: "Mark Lee",
    role: "Owner",
    company: "Northwind Home Services",
    industry: "Local Services",
    initials: "ML",
    quote:
      "They cut our cost per booked job by 27% and more than doubled qualified leads in four months. No fluff, no vanity dashboards — just booked jobs on the calendar. I always know exactly what I'm paying for and what it's returning.",
  },
  {
    name: "Sara Kim",
    role: "Head of Growth",
    company: "Everline Apparel",
    industry: "Shopify · Apparel",
    initials: "SK",
    quote:
      "Our checkout conversion jumped 58% and email became a real revenue channel for the first time. They rebuilt our funnel end to end and the results showed up in weeks, not quarters. Genuinely the first agency that felt like a partner.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="What our clients say"
          description="No stock quotes. Real operators, real numbers, real names."
        />

        <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <RevealItem
              key={t.name}
              as="article"
              className="flex h-full flex-col rounded-2xl border border-ink-100 bg-off-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex text-amber-400"
                  aria-label="5 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-brand-100" aria-hidden="true" />
              </div>

              <blockquote className="mt-4 flex-1 text-base leading-relaxed text-navy-900">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="mt-6 flex items-center gap-4 border-t border-ink-100 pt-5">
                {/* Avatar placeholder — swap for next/image with a real photo. */}
                <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-800 text-white">
                  {t.initials}
                </span>
                <div>
                  <p className="font-700 text-navy-900">{t.name}</p>
                  <p className="text-sm text-ink-600">
                    {t.role}, {t.company}
                  </p>
                  <Badge variant="outline" className="mt-1.5">
                    {t.industry}
                  </Badge>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
