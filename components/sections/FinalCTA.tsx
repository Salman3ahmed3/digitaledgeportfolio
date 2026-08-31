import * as React from "react";

import { site } from "@/lib/site";
import { Container } from "@/components/shared/Container";
import { CTAButton } from "@/components/shared/Button";
import { Reveal } from "@/components/shared/Reveal";

/**
 * Section 14 — Final CTA block (full-width dark navy).
 */
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-navy-900 py-20 md:py-28">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>

      <Container className="relative flex flex-col items-center text-center">
        <Reveal>
          <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.5rem)] font-800 leading-[1.08] tracking-tightest text-white">
            Ready for marketing that actually moves your business forward?
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
            Book your free 30-minute Growth Audit. We&apos;ll analyze your
            current marketing, identify the top 3 revenue leaks, and give you a
            clear action plan. No pitch — just clarity.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-9">
            <CTAButton
              label="Book My Free Growth Audit"
              section="final-cta"
              position="final"
              variant="white"
              size="lg"
              href={site.bookingUrl}
            />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 text-sm font-medium text-white/70">
            <span className="text-brand-100">✓</span> No obligation ·{" "}
            <span className="text-brand-100">✓</span> 30 minutes ·{" "}
            <span className="text-brand-100">✓</span> You keep the audit even if
            we don&apos;t work together
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
