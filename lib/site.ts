/**
 * Central site configuration.
 * Keep brand-wide constants here so they are edited in exactly one place.
 */

export const site = {
  name: "Digital Edge",
  tagline: "Marketing That Moves You Ahead",
  description:
    "Digital Edge builds paid ads, SEO, and full-funnel marketing systems that generate consistent, trackable revenue for growing brands.",
  // TODO(user): Set your production URL for canonical/OG metadata.
  url: "https://digitaledge.example.com",
  // TODO(user): Replace with your real Cal.com booking link, e.g.
  //   "https://cal.com/digital-edge/growth-audit"
  // This single constant powers every "Book a call" CTA on the site.
  bookingUrl: "https://cal.com/your-handle/growth-audit",
  city: "Austin, TX", // TODO(user): Update your city for the footer.
  email: "hello@digitaledge.example.com", // TODO(user): Your real contact email.
  social: {
    // TODO(user): Replace with your real profile URLs (empty = hidden).
    linkedin: "https://www.linkedin.com/company/your-handle",
    instagram: "https://www.instagram.com/your-handle",
    x: "https://x.com/your-handle",
    youtube: "https://www.youtube.com/@your-handle",
  },
} as const;

/** Primary navigation anchors (used by desktop nav + mobile sheet). */
export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
] as const;
