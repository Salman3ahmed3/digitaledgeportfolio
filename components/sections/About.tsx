import * as React from "react";
import { Award, BadgeCheck, Newspaper } from "lucide-react";

import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/shared/Reveal";

/**
 * Section 12 — About / Founder.
 *
 * TODO(user): Replace the founder story, name, signature, photo, and the three
 * credibility badges with real details. The story should focus on WHY you
 * started Digital Edge — not a resume. Drop the founder photo in
 * /public/images/ and render it with next/image (rounded rectangle).
 */
const credibility = [
  { icon: BadgeCheck, label: "Meta Business Partner" },
  { icon: Award, label: "Google Ads Certified" },
  { icon: Newspaper, label: "Featured in [Publication]" },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-24 bg-off-white py-20 md:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Founder photo — rounded rectangle placeholder */}
        <Reveal className="w-full">
          <div className="relative mx-auto max-w-sm">
            <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-primary opacity-10 blur-2xl" />
            <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-3xl border border-ink-100 bg-gradient-to-br from-navy-900 to-brand-600 shadow-card">
              <div className="text-center text-white/90">
                <span className="font-display text-6xl font-800">DE</span>
                <p className="mt-3 text-sm text-white/70">
                  {/* TODO(user): founder photo */}
                  Founder photo
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Story */}
        <div>
          <Reveal>
            <Badge variant="default">Our Story</Badge>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] font-800 leading-tight tracking-tightest text-navy-900">
              Why we started Digital Edge
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            {/* TODO(user): Replace with your real ~150-word founder story (focus on WHY). */}
            <p className="mt-6 text-lg leading-relaxed text-ink-600">
              I spent years inside agencies watching great businesses get buried
              in reports that measured everything except the one thing that
              mattered — revenue. Founders were sold reach, impressions, and
              activity while their bank accounts stayed flat. I started Digital
              Edge to flip that. We treat every dollar of ad spend like it&apos;s
              our own, tie every campaign back to real revenue, and put senior
              operators — not junior account managers — on the work. No long
              lock-ins, no vanity dashboards, no runaround. Just marketing that
              moves the business forward, with the transparency to prove it. If
              that&apos;s the kind of partner you&apos;ve been looking for,
              we should talk.
            </p>
          </Reveal>

          {/* Signature */}
          <Reveal delay={0.15}>
            <div className="mt-6">
              {/* TODO(user): swap for a real signature image if you have one */}
              <p className="font-display text-3xl font-700 italic text-navy-900">
                Alex Founder
              </p>
              <p className="mt-1 text-sm text-ink-600">
                Founder &amp; Lead Strategist, Digital Edge
              </p>
            </div>
          </Reveal>

          {/* Credibility badges */}
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-3">
              {credibility.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-600 text-navy-900 shadow-sm"
                >
                  <item.icon className="h-4 w-4 text-brand-600" />
                  {item.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
