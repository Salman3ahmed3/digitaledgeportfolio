import * as React from "react";

import { Container } from "@/components/shared/Container";

/**
 * Section 4 — Client logo bar.
 * Subtle grayscale marquee that pauses on hover. Under reduced-motion the
 * animation is disabled and logos wrap statically.
 *
 * TODO(user): Replace these text placeholders with real client logos.
 * Drop SV/PNG files into /public/images/clients/ and render them with
 * next/image (grayscale by default, color on hover if desired).
 */

const clients = [
  "Northwind",
  "Acme Co",
  "Lumen",
  "Vertex",
  "BrightPath",
  "Solstice",
  "Cedar & Co",
  "Halcyon",
  "Meridian",
  "Everline",
];

export function LogoBar() {
  return (
    <section
      aria-label="Trusted by"
      className="border-y border-ink-100 bg-white py-10"
    >
      <Container>
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
          Trusted by growing brands across e-commerce, services &amp; SaaS
        </p>
      </Container>

      <div
        className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        aria-hidden="true"
      >
        <div className="flex w-max animate-marquee items-center gap-14 pr-14 group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
          {[...clients, ...clients].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap font-display text-xl font-700 tracking-tight text-ink-600/60 transition-colors hover:text-navy-900"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
