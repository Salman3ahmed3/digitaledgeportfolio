"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { navLinks, site } from "@/lib/site";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { CTAButton } from "@/components/shared/Button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Section 2 — Sticky navigation.
 * Transparent over the hero at the top; on scroll it gains a blurred white
 * background, a hairline border, and a soft shadow (backdrop-blur).
 */
export function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-ink-100 bg-white/80 backdrop-blur-lg shadow-[0_4px_20px_-12px_rgba(15,23,42,0.25)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between md:h-[72px]">
        <a
          href="#top"
          className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          aria-label="Digital Edge — back to top"
        >
          <Logo />
        </a>

        {/* Center nav — desktop */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-[15px] font-medium text-ink-600 transition-colors hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right — desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <CTAButton
            label="Book Free Audit"
            section="nav"
            position="nav"
            variant="primary"
            size="sm"
            href={site.bookingUrl}
          />
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink-100 bg-white/70 text-navy-900 backdrop-blur transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-sm">
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <Logo />
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            </div>
            <nav
              aria-label="Mobile"
              className="flex flex-1 flex-col gap-1 px-6 py-8"
            >
              {navLinks.map((link) => (
                <SheetClose asChild key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-xl px-4 py-3.5 font-display text-xl font-700 text-navy-900 transition-colors hover:bg-brand-100 hover:text-brand-600"
                  >
                    {link.label}
                  </a>
                </SheetClose>
              ))}
            </nav>
            <div className="border-t border-ink-100 px-6 py-6">
              <CTAButton
                label="Book Free Audit"
                section="nav"
                position="nav-mobile"
                variant="primary"
                href={site.bookingUrl}
                className="w-full"
                onClick={() => setOpen(false)}
              />
              <p className="mt-3 text-center text-sm text-ink-600">
                Free 30-min Growth Audit · No obligation
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
