import * as React from "react";
import { Play } from "lucide-react";

import { site } from "@/lib/site";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CTAButton } from "@/components/shared/Button";
import { CountUp } from "@/components/shared/CountUp";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/Reveal";

/**
 * Section 8 — Case Studies (3 featured).
 *
 * TODO(user): Replace all metrics, copy, and client industries below with real,
 * verifiable case studies. Anonymize client names if needed, but keep the
 * numbers honest — unverifiable claims erode trust. Swap the video placeholder
 * for a real Wistia/Vimeo/YouTube embed (see the `videoEmbed` slot).
 */
const caseStudies = [
  {
    industry: "DTC Skincare Brand",
    metricValue: 3.4,
    metricDecimals: 1,
    metricSuffix: "x",
    metricLabel: "ROAS in 90 days",
    challenge:
      "Scaling had stalled at $80k/mo with a blended ROAS under 1.8 and rising CPAs.",
    approach:
      "Rebuilt the funnel around a creative-testing engine and a retention email flow, then reallocated spend to winning audiences.",
    result:
      "3.4x ROAS within 90 days and a 41% lift in repeat-purchase revenue.",
  },
  {
    industry: "B2B Home Services",
    metricValue: 212,
    metricDecimals: 0,
    metricSuffix: "%",
    metricLabel: "more qualified leads",
    challenge:
      "Google Ads were driving calls, but most were tire-kickers outside the service area.",
    approach:
      "Tightened geo + intent targeting, rewrote the landing pages, and added call tracking with lead scoring.",
    result:
      "212% more qualified leads at a 27% lower cost per booked job in 4 months.",
  },
  {
    industry: "Shopify · Apparel",
    metricValue: 58,
    metricDecimals: 0,
    metricSuffix: "%",
    metricLabel: "higher checkout conversion",
    challenge:
      "Strong traffic but a leaky checkout and no post-purchase flow left revenue on the table.",
    approach:
      "Ran CRO on the product + checkout pages and launched Klaviyo flows for abandonment and winback.",
    result:
      "58% higher checkout conversion and a 2.1x increase in email-attributed revenue.",
  },
];

export function CaseStudies() {
  return (
    <section
      id="case-studies"
      className="scroll-mt-24 bg-white py-20 md:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow="Proof"
          title="Real results, real revenue"
          description="A few recent engagements. We lead with the metric that matters — revenue — not impressions."
        />

        <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-3">
          {caseStudies.map((cs) => (
            <RevealItem
              key={cs.industry}
              as="article"
              className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-off-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              {/* Video thumbnail placeholder.
                  TODO(user): replace with a real embed. */}
              <div className="relative aspect-video overflow-hidden bg-gradient-primary">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,114,255,0.5),transparent_60%)]" />
                <button
                  type="button"
                  aria-label={`Play ${cs.industry} case study video`}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play className="ml-1 h-7 w-7 fill-brand-600" />
                  </span>
                </button>
                <span className="absolute bottom-3 left-3 rounded-md bg-black/30 px-2 py-1 text-xs font-medium text-white backdrop-blur">
                  {/* TODO(user): embed Wistia/Vimeo/YouTube here */}
                  Video placeholder
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <Badge variant="outline" className="w-fit">
                  {cs.industry}
                </Badge>

                <p className="mt-4 font-display text-5xl font-800 tracking-tightest">
                  <span className="bg-gradient-cta bg-clip-text text-transparent">
                    <CountUp
                      value={cs.metricValue}
                      decimals={cs.metricDecimals}
                      suffix={cs.metricSuffix}
                    />
                  </span>
                </p>
                <p className="mt-1 text-sm font-600 uppercase tracking-wide text-ink-600">
                  {cs.metricLabel}
                </p>

                <dl className="mt-5 flex flex-col gap-3 border-t border-ink-100 pt-5 text-sm leading-relaxed">
                  <div>
                    <dt className="font-700 text-navy-900">Challenge</dt>
                    <dd className="text-ink-600">{cs.challenge}</dd>
                  </div>
                  <div>
                    <dt className="font-700 text-navy-900">Approach</dt>
                    <dd className="text-ink-600">{cs.approach}</dd>
                  </div>
                  <div>
                    <dt className="font-700 text-navy-900">Result</dt>
                    <dd className="text-ink-600">{cs.result}</dd>
                  </div>
                </dl>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <CTAButton
            label="Get Results Like These — Book a Call"
            section="case-studies"
            position="section-cta"
            variant="primary"
            size="lg"
            href={site.bookingUrl}
            showArrow
          />
          <CTAButton
            label="See More Case Studies"
            section="case-studies"
            position="secondary"
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
