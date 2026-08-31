"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";

/**
 * CTAButton — the canonical conversion button used across the whole page.
 *
 * Every CTA on the site routes through this component so that:
 *   1. Styling stays consistent (primary / secondary / ghost / white variants).
 *   2. Every click is tracked with its label + section + ladder position
 *      (see lib/analytics.ts and the CTA ladder in the brief).
 *
 * It renders an <a> when `href` is provided (external booking link opens in a
 * new tab; in-page "#anchor" links scroll natively) and a <button> otherwise.
 */

type Variant = NonNullable<ButtonProps["variant"]>;
type Size = NonNullable<ButtonProps["size"]>;

interface CTAButtonProps {
  /** Visible button label — also sent to analytics as `cta_label`. */
  label: string;
  /** Section the CTA lives in, for the data layer (e.g. "hero", "pricing"). */
  section: string;
  /** Position in the CTA ladder (e.g. "hero-primary", "nav", "final"). */
  position: string;
  variant?: Variant;
  size?: Size;
  /** Link target. External (http...) opens in a new tab; "#id" scrolls. */
  href?: string;
  onClick?: () => void;
  /** Show a trailing arrow icon. Defaults on for link-style CTAs. */
  showArrow?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function CTAButton({
  label,
  section,
  position,
  variant = "primary",
  size = "default",
  href,
  onClick,
  showArrow = false,
  className,
  ...rest
}: CTAButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  const isExternal = href?.startsWith("http");

  const handleClick = () => {
    trackCTAClick({ label, section, position, destination: href });
    onClick?.();
  };

  const content = (
    <>
      {label}
      {showArrow ? <ArrowRight aria-hidden="true" /> : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={classes}
        data-cta-section={section}
        data-cta-position={position}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classes}
      data-cta-section={section}
      data-cta-position={position}
      {...rest}
    >
      {content}
    </button>
  );
}

/**
 * Trust-remover micro-copy shown directly beneath primary CTAs.
 * Defaults to the standard reassurance line; pass children to override.
 */
export function CTAMicroCopy({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-sm font-medium text-ink-600",
        className,
      )}
    >
      {children ?? (
        <>
          <span className="text-brand-600">✓</span> No obligation ·{" "}
          <span className="text-brand-600">✓</span> 30 mins ·{" "}
          <span className="text-brand-600">✓</span> Actionable insights, not a
          pitch
        </>
      )}
    </p>
  );
}
