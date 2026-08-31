import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Brand logo.
 *
 * This renders a self-contained SVG wordmark + "DE" monogram so the site looks
 * finished out of the box (no broken image before you add your file).
 *
 * TODO(user): Swap this for your real logo. Drop `logo.png` into /public and
 * replace the mark below with, e.g.:
 *
 *   import Image from "next/image";
 *   <Image src="/logo.png" alt="Digital Edge" width={160} height={40} priority />
 *
 * The monogram (<LogoMark />) is reused for the favicon and floating CTA.
 */

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Digital Edge monogram"
      className={cn("h-9 w-9", className)}
    >
      <defs>
        <linearGradient id="de-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0A1F44" />
          <stop offset="100%" stopColor="#1E5BFF" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#de-mark)" />
      <path
        d="M11 12h6.4c4.6 0 7.6 3 7.6 8s-3 8-7.6 8H11V12Zm4 4v8h2.2c2.3 0 3.7-1.5 3.7-4s-1.4-4-3.7-4H15Z"
        fill="#fff"
      />
      <path d="M27 16h4v3h-4v-3Zm0 5h4v3h-4v-3Z" fill="#3B72FF" />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  /** "dark" = navy text (light bg). "light" = white text (dark bg). */
  tone?: "dark" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-xl font-800 tracking-tightest",
          tone === "dark" ? "text-navy-900" : "text-white",
        )}
      >
        Digital&nbsp;Edge
      </span>
    </span>
  );
}
