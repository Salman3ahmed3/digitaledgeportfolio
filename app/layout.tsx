import type { Metadata, Viewport } from "next";

import "./globals.css";
import { inter, sora } from "./fonts";
import { site } from "@/lib/site";
import {
  TrackingScripts,
  TrackingNoscript,
} from "@/components/shared/TrackingScripts";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "digital marketing agency",
    "Meta Ads",
    "Google Ads",
    "SEO",
    "Shopify CRO",
    "full-funnel marketing",
    "growth audit",
  ],
  openGraph: {
    type: "website",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    // TODO(user): add /public/og-image.png (1200x630) for rich link previews.
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  // Favicon is provided by app/icon.svg (DE monogram). Next.js injects it
  // automatically. TODO(user): add app/apple-icon.png for iOS home screens.
};

export const viewport: Viewport = {
  themeColor: "#0A1F44",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        {/*
          TODO(user): Tracking IDs are read from environment variables and
          injected by <TrackingScripts /> below (GTM, GA4, Meta Pixel).
          See components/shared/TrackingScripts.tsx and .env.example.
        */}
        <TrackingScripts />
      </head>
      <body>
        <TrackingNoscript />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
