"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarCheck } from "lucide-react";

import { site } from "@/lib/site";
import { trackCTAClick } from "@/lib/analytics";

/**
 * Floating mobile CTA — appears after 40% scroll on small screens only.
 * Blue pill, bottom-right (CTA ladder depth 6).
 */
export function StickyMobileCTA() {
  const [visible, setVisible] = React.useState(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = (window.scrollY / docHeight) * 100;
      setVisible(percent >= 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-4 md:hidden">
      <AnimatePresence>
        {visible ? (
          <motion.a
            href={site.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackCTAClick({
                label: "Book Free Audit",
                section: "floating-mobile",
                position: "floating",
                destination: site.bookingUrl,
              })
            }
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gradient-cta px-6 py-3.5 font-600 text-white shadow-cta focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <CalendarCheck className="h-5 w-5" />
            Book Free Audit
          </motion.a>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
