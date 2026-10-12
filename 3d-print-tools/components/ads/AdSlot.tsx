"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ADS, adsActive, type AdFormat } from "@/ads.config";

/**
 * Display ad unit with space reserved up-front (see .ad-slot in globals.css) so
 * it never causes layout shift. Renders nothing when ads are off.
 *
 * Placement rules (AdSense policy): never put this inside or directly next to
 * upload zones, settings, download buttons or the 3D canvas.
 */
export function AdSlot({ slot, format, className = "" }: { slot: keyof typeof ADS.slots; format: AdFormat; className?: string }) {
  const ref = useRef<HTMLModElement>(null);
  const pathname = usePathname();
  const excluded = ADS.excludedPaths.some((p) => pathname?.startsWith(p));
  const slotId = ADS.slots[slot];

  useEffect(() => {
    if (!adsActive || excluded || !slotId) return;
    let pushed = false;
    const push = () => {
      const el = ref.current;
      if (pushed || !el || el.offsetWidth === 0) return; // hidden (e.g. sidebar on mobile)
      pushed = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* ignore */
      }
    };
    if (window.__adsReady) push();
    window.addEventListener("ads:ready", push);
    return () => window.removeEventListener("ads:ready", push);
  }, [excluded, slotId]);

  if (!adsActive || excluded || !slotId) return null;
  return (
    <aside aria-label="Advertisement" className={`my-8 ${className}`}>
      <p className="mb-1 text-center text-[11px] uppercase tracking-wide text-[var(--muted)]">Advertisement</p>
      <ins
        ref={ref}
        className="adsbygoogle ad-slot"
        data-format={format}
        style={{ display: "block" }}
        data-ad-client={ADS.client}
        data-ad-slot={slotId}
        data-ad-format={format === "in-content" ? "fluid" : "auto"}
        data-ad-layout={format === "in-content" ? "in-article" : undefined}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
