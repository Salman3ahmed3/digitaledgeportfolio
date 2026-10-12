import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/site.config";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  /** Path to the OG image; defaults to the home image. */
  ogImage?: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  const ogImage = opts.ogImage ?? "/og/home.png";
  const fullTitle = opts.path === "/" ? opts.title : `${opts.title} | ${SITE.name}`;
  return {
    title: { absolute: fullTitle },
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description: opts.description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: absoluteUrl(ogImage), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: opts.description,
      site: SITE.twitter || undefined,
      images: [absoluteUrl(ogImage)],
    },
  };
}

type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function webAppLd(opts: { name: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    applicationCategory: "DesignApplication",
    operatingSystem: "Any (runs in a modern web browser)",
    browserRequirements: "Requires JavaScript and WebGL",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}

export function faqLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function howToLd(opts: { name: string; steps: { name: string; text: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    tool: [{ "@type": "HowToTool", name: "A modern web browser" }],
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function articleLd(opts: { title: string; description: string; path: string; updated: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: absoluteUrl(opts.path),
    dateModified: opts.updated,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}
