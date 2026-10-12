import { CONSENT, adsActive, analyticsActive } from "@/ads.config";

/** Inline <head> snippet: Consent Mode v2 defaults, set before any Google tag runs. */
export function consentDefaultsScript(): string | null {
  if (!adsActive && !analyticsActive) return null;
  const denied = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" };
  const granted = { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" };
  return [
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;",
    `gtag('consent','default',${JSON.stringify({ ...denied, region: CONSENT.deniedRegions, wait_for_update: 500 })});`,
    `gtag('consent','default',${JSON.stringify(granted)});`,
  ].join("");
}
