# PrintBench — free browser-based 3D printing tools

Static Next.js site with client-side 3D tools: Image to STL, SVG to STL (extrude,
stencil, keychain, cookie cutter, text), Lithophane Maker and a multi-format 3D
viewer. **All file processing runs in the browser** (three.js + Web Workers +
manifold-3d WASM). Nothing is uploaded; the host only serves static files.

> `PrintBench` / `printbench.example` are placeholders. Change them in
> `site.config.ts` before launch.

## Setup

```bash
cd 3d-print-tools
npm install
npm run dev        # http://localhost:3000 (ads/analytics always off in dev)
npm run build      # static export → out/
npm run serve      # serve out/ on http://localhost:4173 (gzip, like a real host)
npm test           # Vitest: geometry + content + SEO checks on out/
npm run test:e2e   # Playwright against out/ (build first)
```

Node 20+ is required. `predev`/`prebuild` copy `manifold.wasm` into `public/wasm/`.

## Project layout

| Path | What it is |
|---|---|
| `site.config.ts` | Brand name, domain, contact email |
| `ads.config.ts` | AdSense client/slots, consent (CMP) and GA4 settings |
| `content/tools/*.ts` | Copy and presets for every tool page (edit text here) |
| `content/guides/*.ts` | Long-form guides |
| `app/` | Routes: `/[slug]` tool pages, `/guides/[slug]`, legal pages, sitemap, robots, `/og/*.png` |
| `components/tools/*` | Tool widgets (client only, lazy-loaded) |
| `lib/engines/*` | Pure geometry: SVG, image (heightmap/trace), lithophane, text |
| `lib/geometry/*` | Mesh analysis, exporters (STL, OBJ, 3MF, GLB, PLY), manifold loader |
| `lib/workers/*` | Comlink worker that runs every build/parse/export |
| `tests/` | Unit (`tests/unit`), E2E (`tests/e2e`), fixtures (`npm run fixtures` regenerates them) |

## Adding a new preset page

1. Add a `ToolPage` object in `content/tools/` (or in an existing file), with:
   - `slug`, `engine` (`image` | `svg` | `lithophane` | `viewer`)
   - `preset`: overrides for that engine's settings (see `lib/engines/<engine>/settings.ts`,
     e.g. `{ mode: "keychain", width: 40 }`; the viewer takes `{ focus: "obj" }`)
   - `defaultFormat` (optional): `stl` | `obj` | `3mf` | `glb` | `ply`
   - Unique `title`, `metaDescription`, `h1`, `valueLine`, intro (120–200 words), 4–5 how-to
     steps, settings, 3 use cases, print tips, 6–8 FAQs, `related` slugs.
2. Register it in `content/tools/index.ts`.
3. `npm test` checks the copy brief, duplicate titles/descriptions and that every
   internal link exists. The sitemap, OG image, JSON-LD and nav update automatically.

Only add a page when the engine genuinely supports that input/output and the copy
can be different enough to stand on its own.

## Ads, consent and analytics

Everything lives in `ads.config.ts`; ads and analytics never load in `next dev`.

1. **AdSense**: set `ADS.enabled = true`, `ADS.client = "ca-pub-…"` and the three
   slot IDs (`belowTool`, `inContent`, `sidebar`). Set `autoAnchor` and enable the
   anchor format in AdSense if you want Auto ads' anchor.
2. **Placements** (in `components/tool-page/ToolPageLayout.tsx` and the guide page):
   one responsive unit after the "About" copy (below the tool), up to two in-content
   units between sections, one sidebar unit at ≥1280 px. Each `<AdSlot>` reserves its
   height to keep CLS at 0, is labelled "Advertisement", and never sits next to the
   upload zone, settings, download button or 3D canvas. Pages in `excludedPaths`
   (privacy, terms, contact, cookie policy, about) never show ads.
3. **Consent**: `CONSENT.cmp = "google"` uses Google's certified CMP (configure a
   GDPR message in AdSense → Privacy & messaging). Consent Mode v2 defaults to
   *denied* for the EEA, UK and Switzerland (`deniedRegions`), and ad units are only
   requested after the TCF API reports a decision. Use `"custom"` for another
   certified CMP that exposes `__tcfapi` (load its script yourself).
4. **GA4**: set `ANALYTICS.measurementId`. Events (from `lib/analytics.ts` only):
   `file_uploaded` (tool, file type), `settings_changed` (tool, throttled),
   `download` (tool, format, triangle bucket), `error` (tool, code). No file names
   or contents are ever sent.
5. **Layout check without an AdSense account**:
   `NEXT_PUBLIC_ADS_PREVIEW=1 npm run build` renders grey boxes in every ad position.

The Google scripts load after the first interaction or when the browser is idle.
If an ad blocker stops them, the tools work exactly the same.

## Deployment

The site is fully static (`out/`).

- **Cloudflare Pages**: build command `cd 3d-print-tools && npm ci && npm run build`,
  output directory `3d-print-tools/out`.
- **Vercel**: set the project root directory to `3d-print-tools`; framework Next.js
  (static export is detected from `output: "export"`).
- Make sure `.wasm` is served as `application/wasm` (both hosts do this by default).
- After the first deploy, submit `https://<domain>/sitemap.xml` in Google Search Console.

## Quality status (at handover)

- Vitest: 154 tests (watertight checks for every engine/mode, thickness mapping,
  holes in “O”/“A”, stroke-only SVG, real-width scaling ±0.01 mm, STL round-trip
  through three's STLLoader, exporters, content brief, SEO output).
- Playwright: 33 tests (each tool: upload → change two settings → preview → download;
  viewer loads STL ASCII/binary, OBJ+MTL, 3MF, PLY, GLB; lazy engine loading; no
  third-party requests while using a tool).
- Lighthouse mobile (local static server with gzip): Performance 97–99,
  Accessibility 100, Best Practices 100, SEO 100, CLS 0, LCP 1.7–2.3 s — measured
  with ads off and with ad-slot preview on. Re-check on your real host with live ads.
- Initial JS on tool pages ≈ 140 KB gzip (excluding the legacy `noModule` polyfill
  that modern browsers skip). three.js, workers and WASM load on first interaction
  or file drop.

## Known limitations

- **Heightmaps don't decimate flat areas**; "Detail" lowers mesh density uniformly.
- **Tracing** uses a built-in contour tracer (pixel boundaries + Chaikin smoothing +
  Douglas–Peucker) rather than potrace; very small logos look softer than vectors.
- **Bevel** is a stepped chamfer (4 inset layers), not a true rounded fillet.
- **SVG**: gradients become a single grey layer; `<text>` must be converted to paths;
  external `<use>`/images are ignored.
- **Text**: three bundled OFL fonts (Inter Bold, Bebas Neue, Pacifico); Latin glyphs
  only, no ligatures or complex-script shaping.
- **Viewer**: OBJ textures, glTF with external `.bin`/textures, animations and point
  clouds are not supported; 3MF units are assumed to be millimetres; very large files
  are limited by device memory (STL/OBJ/PLY parse in a worker, 3MF/GLB on the main thread).
- **Lithophane**: phase-2 shapes (sphere, dome, oval, hexagon, star, box) are not built
  yet; text is available on flat and curved shapes only; the backlit view and the
  weight/time numbers are estimates.
- **Examples**: the "Example uses" sections are text only — add before/after images
  (e.g. screenshots of the preview) when you have them.
- **Rich results**: FAQPage and HowTo JSON-LD are valid, but Google currently shows
  FAQ rich results only for a small set of authoritative sites and has retired HowTo
  rich results, so don't expect SERP features from them.
- Legal pages are drafts; have them reviewed for your jurisdictions.
