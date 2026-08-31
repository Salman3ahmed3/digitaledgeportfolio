import * as React from "react";
import { Linkedin, Instagram, Twitter, Youtube } from "lucide-react";

import { site, navLinks } from "@/lib/site";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { NewsletterForm } from "@/components/shared/NewsletterForm";

/**
 * Section 15 — Footer.
 * TODO(user): Update social links, city, and legal page URLs in lib/site.ts
 * and below.
 */
const columns = [
  {
    title: "Services",
    links: [
      { label: "Meta & Google Ads", href: "#services" },
      { label: "SEO & Content", href: "#services" },
      { label: "Shopify / E-com CRO", href: "#services" },
      { label: "Full-Funnel Systems", href: "#services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Process", href: "#process" },
      { label: "Case Studies", href: "#case-studies" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      // TODO(user): point these at real pages / lead magnets
      { label: "Growth Audit", href: site.bookingUrl },
      { label: "Meta Ads Playbook", href: "#" },
      { label: "Blog", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

const socials = [
  { icon: Linkedin, href: site.social.linkedin, label: "LinkedIn" },
  { icon: Instagram, href: site.social.instagram, label: "Instagram" },
  { icon: Twitter, href: site.social.x, label: "X (Twitter)" },
  { icon: Youtube, href: site.social.youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr_1.4fr]">
          {/* Brand */}
          <div>
            <Logo tone="light" />
            <p className="mt-4 font-display text-lg font-700 text-brand-100">
              {site.tagline}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              Full-funnel marketing systems that generate consistent, trackable
              revenue for growing brands — with the transparency to prove it.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-brand-500 hover:bg-brand-600 hover:text-white"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-700 uppercase tracking-wide text-white">
                  {col.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-white"
                        {...(link.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display text-lg font-800 text-white">
              Get weekly marketing tactics
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Actionable tactics that actually move revenue — straight to your
              inbox. No spam, unsubscribe anytime.
            </p>
            <div className="mt-4">
              <NewsletterForm
                formName="newsletter_footer"
                buttonLabel="Subscribe"
                tone="light"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-sm text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-white">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms
            </a>
          </nav>
          <p>
            Made with <span className="text-red-400">❤</span> in {site.city}
          </p>
        </Container>
      </div>
    </footer>
  );
}
