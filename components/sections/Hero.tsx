"use client";

import * as React from "react";
import { Check, Star } from "lucide-react";

import { site } from "@/lib/site";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/badge";
import { CTAButton, CTAMicroCopy } from "@/components/shared/Button";
import { HeroDashboard } from "@/components/shared/HeroDashboard";
import { Reveal } from "@/components/shared/Reveal";

const bullets = [
  "Predictable, trackable lead flow — not vanity metrics",
  "Senior operators on your account, not junior hand-offs",
  "Month-to-month. No long lock-in contracts, ever",
];

/**
 * Section 3 — Hero.
 * 60/40 two-column on desktop, stacked on mobile.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-off-white pb-16 pt-14 md:pb-24 md:pt-20"
    >
      {/* Soft background field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
        {/* Left */}
        <div className="flex flex-col items-start">
          <Reveal>
            <Badge variant="outline">
              Digital Marketing Agency · Since 20XX
              {/* TODO(user): Set your founding year. */}
            </Badge>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 max-w-2xl font-display text-[clamp(2.5rem,5vw,4.75rem)] font-800 leading-[1.03] tracking-tightest text-navy-900">
              Marketing That Actually{" "}
              <span className="bg-gradient-cta bg-clip-text text-transparent">
                Moves Your Business
              </span>{" "}
              Ahead
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600 md:text-xl">
              We build paid ads, SEO, and funnel systems that generate
              consistent, trackable revenue — without the agency runaround,
              vanity metrics, or long lock-in contracts.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="mt-8 flex flex-col gap-3">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-100 text-brand-600">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span className="text-base font-medium text-navy-900">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-9 flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <CTAButton
                  label="Get My Free 30-Min Growth Audit"
                  section="hero"
                  position="hero-primary"
                  variant="primary"
                  size="lg"
                  href={site.bookingUrl}
                />
                <CTAButton
                  label="See Client Results"
                  section="hero"
                  position="hero-secondary"
                  variant="secondary"
                  size="lg"
                  href="#case-studies"
                  showArrow
                />
              </div>
              <CTAMicroCopy className="mt-1" />
            </div>
          </Reveal>

          {/* Micro-trust row */}
          <Reveal delay={0.25}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="flex" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-navy-900">
                  4.9 avg ·{" "}
                  <span className="text-ink-600">
                    Trusted by 40+ growing brands
                  </span>
                </p>
              </div>
              {/* Tiny client logos strip — TODO(user): replace with real logos */}
              <div className="flex items-center gap-4 opacity-70">
                {["Acme", "Northwind", "Lumen", "Vertex"].map((name) => (
                  <span
                    key={name}
                    className="text-sm font-700 tracking-tight text-ink-600"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right — dashboard graphic */}
        <Reveal delay={0.15} className="w-full">
          <HeroDashboard />
        </Reveal>
      </Container>
    </section>
  );
}
