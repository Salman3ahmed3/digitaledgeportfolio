# Digital Edge — Marketing Agency Landing Page

[![CI](https://github.com/Salman3ahmed3/digitaledgeportfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Salman3ahmed3/digitaledgeportfolio/actions/workflows/ci.yml)

A high-conversion, single-page marketing site for **Digital Edge**, built to book
free 30-minute Growth Audit calls and grow an email list via a lead-magnet.

> **Tagline:** _Marketing That Moves You Ahead_

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui +
Framer Motion**. Mobile-first, accessible (WCAG AA), and performance-minded.

---

## ✨ What's inside

15 sections, top to bottom: dismissible announcement bar, sticky nav, hero with
an animated results dashboard, client logo marquee, problem/agitate, services,
process timeline, case studies, an **honest comparison table** (it concedes one
tradeoff on purpose), testimonials, transparent pricing, founder/about, FAQ, a
full-width final CTA, and the footer.

A **layered CTA system** (not one repeated button): announcement bar → nav →
hero primary/secondary → contextual section CTAs → floating mobile pill →
exit-intent modal → final CTA → footer newsletter. Every CTA is tracked with its
label, section, and ladder position (see `lib/analytics.ts`).

---

## 🚀 Local development

Requires **Node 18.18+** (Node 20+ recommended).

```bash
# 1. Install dependencies
npm install          # or: pnpm install

# 2. (optional) add tracking IDs
cp .env.example .env.local   # then fill in GTM / GA4 / Meta Pixel IDs

# 3. Run the dev server
npm run dev          # http://localhost:3000

# Production build + serve
npm run build
npm run start

# Lint
npm run lint
```

---

## 🎨 Brand tokens

The brand palette, fonts, gradients, and shadows live in
[`tailwind.config.ts`](./tailwind.config.ts) (with a CSS-variable mirror in
[`app/globals.css`](./app/globals.css)):

| Token | Value | Use |
| --- | --- | --- |
| `navy-900` | `#0A1F44` | Primary dark / headings |
| `brand-600` | `#1E5BFF` | Primary brand blue / CTAs |
| `brand-500` | `#3B72FF` | CTA gradient end |
| `brand-100` | `#E8F0FF` | Soft blue tint backgrounds |
| `ink-900 / 600 / 100` | slate scale | Body / secondary / dividers |
| `off-white` | `#FAFBFC` | Alternate section backgrounds |

Fonts are loaded with `next/font` in [`app/fonts.ts`](./app/fonts.ts):
**Sora** (display/headings) + **Inter** (body).

---

## 🔧 Where to customize

Everything you'll realistically change is marked in code with a
**`TODO(user):`** comment. Search the repo for `TODO(user)` to find them all.

### Booking link (Cal.com)

One constant powers every "Book a call" CTA on the site:

```ts
// lib/site.ts
bookingUrl: "https://cal.com/your-handle/growth-audit", // ← replace this
```

Replace it with your real Cal.com (or Calendly, etc.) link. To embed the
scheduler inline instead of linking out, add the Cal.com embed and point the
CTAs at the embedded element.

### Logo & favicon

- **Logo:** drop `logo.png` into `/public`, then update
  [`components/shared/Logo.tsx`](./components/shared/Logo.tsx) to render it with
  `next/image` (a self-contained SVG wordmark ships as the default).
- **Favicon:** the "DE" monogram in [`app/icon.svg`](./app/icon.svg) is served
  automatically by Next.js. Replace that file, or add `app/apple-icon.png`.

### Images

Add real assets under `/public/images/` and swap the placeholders:

| What | Where to edit |
| --- | --- |
| Hero dashboard graphic | `components/shared/HeroDashboard.tsx` |
| Client logos (marquee) | `components/sections/LogoBar.tsx` |
| Case-study thumbnails / video embeds | `components/sections/CaseStudies.tsx` |
| Testimonial avatars | `components/sections/Testimonials.tsx` |
| Founder photo + signature | `components/sections/About.tsx` |
| Social share image (`og-image.png`, 1200×630) | `app/layout.tsx` metadata |

### Copy that needs YOUR real content

These are intentionally left as clearly-marked placeholders — **confirm before
launch**:

- **Pricing** (`components/sections/Pricing.tsx`) — the `$1,500 / $4,000 /
  Custom` anchors are placeholders. Set real numbers.
- **Case-study metrics** (`components/sections/CaseStudies.tsx`) — use real,
  verifiable numbers only.
- **Testimonials** (`components/sections/Testimonials.tsx`) — real names,
  roles, quotes (each with a specific metric).
- **Founder story** (`components/sections/About.tsx`) — your ~150-word "why".
- **Founding year, city, email, socials** (`lib/site.ts`).
- **Scarcity number** in the announcement bar
  (`components/sections/AnnouncementBar.tsx`).

---

## 📈 Analytics & tracking

Tracking is opt-in via environment variables and only loads when an ID is set
(see `.env.example` and [`components/shared/TrackingScripts.tsx`](./components/shared/TrackingScripts.tsx)):

```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=000000000000000
```

Conversion + data-layer events are centralized in
[`lib/analytics.ts`](./lib/analytics.ts) and fire on:

- **CTA click** — every button reports `cta_label`, `cta_section`, `cta_position`
- **Form submit** — newsletter / exit-intent (GA4 `generate_lead`, Meta `Lead`)
- **Modal open** — exit-intent modal
- **Scroll depth** — 25 / 50 / 75 / 100%, once each

To connect the newsletter/exit-intent forms to a real ESP/CRM (Klaviyo,
ConvertKit, Mailchimp, HubSpot…), wire the `onSubmit` in
[`components/shared/NewsletterForm.tsx`](./components/shared/NewsletterForm.tsx).

---

## ♿ Accessibility & performance

- Semantic HTML5 landmarks, skip-to-content link, ARIA labels on interactive
  elements, visible focus states, keyboard-navigable menus/accordion/dialogs.
- Respects `prefers-reduced-motion` (animations degrade to static).
- `next/font` (no FOUT), `next/image`-ready, WCAG-AA contrast.
- Targets Lighthouse 90+ mobile / 95+ desktop. Run an audit after adding real
  images and confirm they're sized and use `next/image`.

---

## ✅ Continuous integration & dependencies

Every pull request (and every push to the production branch) runs
[`.github/workflows/ci.yml`](.github/workflows/ci.yml) on Node 22:

```bash
npm ci
npm run lint
npm run build
```

Dependabot ([`.github/dependabot.yml`](.github/dependabot.yml)) opens weekly
update PRs for npm packages and GitHub Actions; security updates are opened as
soon as an alert has a fix. Let CI pass and check the Vercel preview before merging.

> **Branches:** the default branch is currently `claude/digital-edge-landing-7x230n`,
> and Vercel deploys Production from it. Don't rename or delete it until the
> production branch has been switched in Vercel.

## 🌐 Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects
   Next.js; no build config needed.
3. Add your `NEXT_PUBLIC_*` env vars in **Project → Settings → Environment
   Variables**.
4. Deploy. Add your custom domain under **Settings → Domains** and update
   `site.url` in `lib/site.ts` for correct canonical/OG metadata.

Any Node host works too: `npm run build && npm run start`.

---

## 🗂 Project structure

```
app/
  layout.tsx          # metadata, fonts, tracking, skip-link
  page.tsx            # section composition
  globals.css         # tokens + base styles
  fonts.ts            # Inter + Sora via next/font
  icon.svg            # favicon (DE monogram)
components/
  sections/           # the 15 page sections
  ui/                 # shadcn/ui primitives (button, input, dialog, sheet, accordion, badge)
  shared/             # Button (CTA), Container, SectionHeading, Reveal, CountUp,
                      # Logo, HeroDashboard, StickyMobileCTA, ExitIntentModal,
                      # NewsletterForm, TrackingScripts, AnalyticsProvider
lib/
  utils.ts            # cn() class merge
  analytics.ts        # event tracking helpers
  site.ts             # booking link, nav, brand constants
public/
  images/             # clients / case-studies / testimonials
tailwind.config.ts    # brand tokens
```

---

_Reference quality bar: linear.app / framer.com / ramp.com._
