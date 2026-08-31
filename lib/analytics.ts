/**
 * Analytics + conversion tracking helpers.
 * ---------------------------------------------------------------------------
 * This is the single choke point for every tracking event on the site. It
 * pushes a normalized event into the GTM `dataLayer` and mirrors key
 * conversions to GA4 (gtag) and the Meta Pixel (fbq) when those are present.
 *
 * TODO(user): Wire the real container / pixel / measurement IDs.
 *   - GTM container ID .......... see app/layout.tsx <head> placeholder
 *   - Meta Pixel ID ............. see app/layout.tsx <head> placeholder
 *   - GA4 Measurement ID ........ see app/layout.tsx <head> placeholder
 *
 * Everything here is SSR-safe (guards `window`) so it can be imported from
 * server or client components without breaking the build.
 */

type Primitive = string | number | boolean | null | undefined;

export interface AnalyticsPayload {
  [key: string]: Primitive;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Low-level push into the GTM data layer. Safe to call anywhere. */
export function pushDataLayer(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

/**
 * Track a CTA click. Every primary/secondary CTA on the site calls this with
 * its label, the section it lives in, and its position in the CTA ladder.
 *
 * @example trackCTAClick({ label: "Get My Free 30-Min Growth Audit", section: "hero", position: "hero-primary" })
 */
export function trackCTAClick(params: {
  label: string;
  section: string;
  position: string;
  destination?: string;
}) {
  pushDataLayer("cta_click", {
    cta_label: params.label,
    cta_section: params.section,
    cta_position: params.position,
    cta_destination: params.destination,
  });

  // Mirror to GA4 as a conversion-style event.
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "cta_click", {
      cta_label: params.label,
      cta_section: params.section,
      cta_position: params.position,
    });
  }
}

/** Track a lead form submission (audit request / newsletter). */
export function trackFormSubmit(formName: string, extra: AnalyticsPayload = {}) {
  pushDataLayer("form_submit", { form_name: formName, ...extra });

  if (typeof window !== "undefined") {
    window.gtag?.("event", "generate_lead", { form_name: formName });
    // Meta standard event for lead capture.
    window.fbq?.("track", "Lead", { form_name: formName });
  }
}

/** Track the exit-intent modal opening. */
export function trackModalOpen(modalName: string) {
  pushDataLayer("modal_open", { modal_name: modalName });
  if (typeof window !== "undefined") {
    window.fbq?.("track", "ViewContent", { content_name: modalName });
  }
}

/**
 * Track scroll depth milestones. `installScrollDepthTracking` wires a single
 * passive scroll listener that fires 25/50/75/100 exactly once each.
 */
export function trackScrollDepth(percent: 25 | 50 | 75 | 100) {
  pushDataLayer("scroll_depth", { percent });
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "scroll", { percent_scrolled: percent });
  }
}

const SCROLL_MILESTONES: Array<25 | 50 | 75 | 100> = [25, 50, 75, 100];

export function installScrollDepthTracking(): () => void {
  if (typeof window === "undefined") return () => {};

  const fired = new Set<number>();

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const percent = (scrollTop / docHeight) * 100;

    for (const milestone of SCROLL_MILESTONES) {
      if (percent >= milestone && !fired.has(milestone)) {
        fired.add(milestone);
        trackScrollDepth(milestone);
      }
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}
