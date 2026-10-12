/**
 * Single source of truth for AdSense, consent and analytics.
 *
 * Ads and analytics never load in development (`next dev`). In production they
 * load only when `enabled` is true AND the IDs below are filled in.
 */

export type AdFormat = "responsive" | "in-content" | "sidebar";

export const ADS = {
  enabled: false,
  /** "ca-pub-XXXXXXXXXXXXXXXX" */
  client: "",
  /** Slot IDs from AdSense → Ads → By ad unit. */
  slots: {
    belowTool: "",
    inContent: "",
    sidebar: "",
  },
  /** Let AdSense Auto ads place an anchor ad (enable in AdSense UI too). */
  autoAnchor: false,
  /** Route prefixes where ads must never render. */
  excludedPaths: ["/privacy", "/terms", "/contact", "/cookie-policy", "/about"],
  /** Max in-content units on one long page. */
  maxInContent: 2,
} as const;

/**
 * Consent configuration.
 * - cmp "none": no CMP (only acceptable if you never serve EEA/UK/CH users).
 * - cmp "google": Google's certified CMP (AdSense → Privacy & messaging). The
 *   loader waits for the TCF API to report a decision before requesting ads.
 * - cmp "custom": another Google-certified CMP you add yourself; it must expose
 *   window.__tcfapi. Same waiting logic applies.
 */
export const CONSENT = {
  cmp: "google" as "none" | "google" | "custom",
  /** Consent Mode v2 defaults to "denied" for these regions (ISO 3166-1/2). */
  deniedRegions: [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
    "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO",
    "SK", "SI", "ES", "SE", "GB", "CH",
  ],
  /** Give up waiting for the CMP after this many ms (ads stay unrequested). */
  timeoutMs: 8000,
};

export const ANALYTICS = {
  /** GA4 measurement ID, e.g. "G-XXXXXXX". Empty = analytics off. */
  measurementId: "",
};

export const isProd = process.env.NODE_ENV === "production";
export const adsActive = isProd && ADS.enabled && ADS.client !== "";
/**
 * Layout check without real ads: `NEXT_PUBLIC_ADS_PREVIEW=1 npm run build`
 * renders grey, labelled boxes in every ad position (no Google scripts load).
 */
export const adsPreview = process.env.NEXT_PUBLIC_ADS_PREVIEW === "1";
export const analyticsActive = isProd && ANALYTICS.measurementId !== "";
