"use client";

import * as React from "react";

import { installScrollDepthTracking } from "@/lib/analytics";

/**
 * Installs global, fire-once scroll-depth tracking (25/50/75/100).
 * Mount once near the root. Renders nothing.
 */
export function AnalyticsProvider() {
  React.useEffect(() => {
    const cleanup = installScrollDepthTracking();
    return cleanup;
  }, []);

  return null;
}
