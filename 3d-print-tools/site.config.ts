/**
 * Brand + domain settings. Replace the placeholders before launch:
 * every page title, canonical URL, sitemap entry and OG image reads from here.
 */
export const SITE = {
  name: "PrintBench",
  url: "https://printbench.example", // no trailing slash
  tagline: "Free browser-based 3D printing tools",
  description:
    "Free 3D printing tools that run in your browser: image to STL, SVG to STL, lithophane maker and STL viewer. No signup, unlimited, and your files never leave your device.",
  contactEmail: "hello@printbench.example",
  twitter: "", // e.g. "@printbench" — leave empty to omit
  locale: "en_US",
} as const;

export const absoluteUrl = (path = "/") =>
  `${SITE.url}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;
