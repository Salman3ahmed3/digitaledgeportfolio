"use client";

import * as React from "react";
import { X } from "lucide-react";

import { site } from "@/lib/site";
import { trackCTAClick } from "@/lib/analytics";

const STORAGE_KEY = "de_announcement_dismissed_v1";

/**
 * Section 1 — Dismissible announcement bar.
 * Urgency + scarcity hook with an inline CTA. Dismissal persists per browser
 * via localStorage so returning visitors aren't nagged.
 *
 * TODO(user): Update the scarcity number ("Only 5 …") to reflect real
 * availability, or wire it to your CRM/calendar.
 */
export function AnnouncementBar() {
  const [dismissed, setDismissed] = React.useState(true);

  React.useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore storage errors (private mode) */
    }
  };

  if (dismissed) return null;

  return (
    <div className="relative z-50 bg-navy-900 text-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-3 px-10 py-2.5 text-center text-sm">
        <p className="font-medium">
          <span aria-hidden="true">🎯</span> Only{" "}
          <span className="font-700 text-brand-100">5 free Growth Audits</span>{" "}
          left this month{" "}
          <a
            href={site.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackCTAClick({
                label: "Claim Yours",
                section: "announcement-bar",
                position: "announcement",
                destination: site.bookingUrl,
              })
            }
            className="ml-1 inline-flex items-center gap-1 font-700 text-white underline decoration-brand-500 decoration-2 underline-offset-4 transition-colors hover:text-brand-100"
          >
            → Claim Yours
          </a>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
