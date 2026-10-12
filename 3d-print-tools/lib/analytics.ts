/**
 * GA4 wrapper. The only place analytics events are sent from.
 * Never pass file names, file contents or anything typed by the user.
 */
import { analyticsActive } from "@/ads.config";

type EventMap = {
  file_uploaded: { tool: string; file_type: string };
  settings_changed: { tool: string };
  download: { tool: string; format: string; triangles: string };
  error: { tool: string; error_code: string };
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function triangleBucket(n: number): string {
  if (n < 10_000) return "<10k";
  if (n < 100_000) return "10k-100k";
  if (n < 500_000) return "100k-500k";
  if (n < 2_000_000) return "500k-2M";
  return "2M+";
}

const lastSettingsEvent: Record<string, number> = {};

export function track<E extends keyof EventMap>(name: E, params: EventMap[E]) {
  if (typeof window === "undefined") return;
  if (name === "settings_changed") {
    // Throttle: one settings event per tool per 30 s is plenty.
    const key = (params as EventMap["settings_changed"]).tool;
    const now = Date.now();
    if (now - (lastSettingsEvent[key] ?? 0) < 30_000) return;
    lastSettingsEvent[key] = now;
  }
  if (!analyticsActive) {
    if (process.env.NODE_ENV !== "production") console.debug("[analytics]", name, params);
    return;
  }
  window.gtag?.("event", name, params);
}

/** File extension only, lower-cased — never the name. */
export function fileType(file: File): string {
  const m = /\.([a-z0-9]{1,5})$/i.exec(file.name);
  return (m?.[1] ?? file.type.split("/")[1] ?? "unknown").toLowerCase();
}
