"use client";

import { useEffect } from "react";
import { ADS, ANALYTICS, CONSENT, adsActive, analyticsActive } from "@/ads.config";

declare global {
  interface Window {
    __tcfapi?: (cmd: string, version: number, cb: (data: TcData, success: boolean) => void) => void;
    adsbygoogle?: unknown[];
    __adsReady?: boolean;
  }
}
interface TcData { eventStatus?: string; gdprApplies?: boolean; cmpStatus?: string }

function loadScript(src: string, attrs: Record<string, string> = {}) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed: ${src}`));
    document.head.appendChild(s);
  });
}

/** Resolves once the CMP has a decision (or GDPR doesn't apply). */
function waitForConsent(): Promise<boolean> {
  if (CONSENT.cmp === "none") return Promise.resolve(true);
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (typeof window.__tcfapi === "function") {
        window.__tcfapi("addEventListener", 2, (data, ok) => {
          if (!ok) return;
          if (data.gdprApplies === false || data.eventStatus === "tcloaded" || data.eventStatus === "useractioncomplete") {
            resolve(true);
          }
        });
        return;
      }
      if (Date.now() - started > CONSENT.timeoutMs) return resolve(false);
      setTimeout(tick, 250);
    };
    tick();
  });
}

const isExcluded = () => ADS.excludedPaths.some((p) => location.pathname.startsWith(p));

async function boot() {
  if (analyticsActive) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.measurementId}`).catch(() => {});
    window.gtag?.("js", new Date());
    window.gtag?.("config", ANALYTICS.measurementId, { anonymize_ip: true });
  }
  if (!adsActive || isExcluded()) return;
  try {
    // The AdSense tag also serves Google's certified CMP message when it is
    // configured in AdSense → Privacy & messaging.
    await loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.client}`, {
      crossorigin: "anonymous",
    });
  } catch {
    return; // ad blocker: tools keep working, nothing else to do
  }
  const consented = await waitForConsent();
  if (!consented) return;
  window.__adsReady = true;
  window.dispatchEvent(new Event("ads:ready"));
}

/** Loads analytics/ads after the first interaction or when the browser is idle. */
export function ThirdPartyScripts() {
  useEffect(() => {
    if (!adsActive && !analyticsActive) return;
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      cleanup();
      void boot();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    const idle =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(start, { timeout: 5000 })
        : (setTimeout(start, 3500) as unknown as number);
    function cleanup() {
      events.forEach((e) => window.removeEventListener(e, start));
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    }
    return cleanup;
  }, []);
  return null;
}

