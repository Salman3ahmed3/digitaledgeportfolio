import { Inter, Sora } from "next/font/google";

/**
 * Body font — Inter.
 * Loaded via next/font to eliminate layout shift (no FOUT) and self-host.
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

/**
 * Heading / display font — Sora.
 * Tight, geometric, premium — used for all headings.
 */
export const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
  weight: ["600", "700", "800"],
});
