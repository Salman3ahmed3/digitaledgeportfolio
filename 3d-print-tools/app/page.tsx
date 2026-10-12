import Link from "next/link";
import { TOOLS } from "@/content/tools";
import { GUIDES } from "@/content/guides";
import { ToolCard } from "@/components/tool-page/ToolCard";
import { TrustChips } from "@/components/tool-page/TrustChips";
import { Faq } from "@/components/tool-page/Faq";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqLd, pageMetadata } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/site.config";
import type { QA } from "@/content/types";

export const metadata = pageMetadata({
  title: `${SITE.name} — Free 3D Printing Tools: Image to STL, SVG to STL, Lithophane Maker`,
  description: SITE.description,
  path: "/",
  ogImage: "/og/home.png",
});

const FAQ: QA[] = [
  {
    q: "Are these 3D printing tools really free?",
    a: "Yes. Every tool is free with no conversion limits, no file-size paywall and no account. The site is supported by display ads.",
  },
  {
    q: "Do you upload my images or models?",
    a: "No. Files are read and processed by your own browser using WebGL, Web Workers and WebAssembly. Nothing you open is sent to our server, which only delivers the web pages.",
  },
  {
    q: "Which file formats can I export?",
    a: "The generators export binary STL by default, plus OBJ and 3MF. The viewer can also convert models to GLB and PLY.",
  },
  {
    q: "Are the exported models ready to slice?",
    a: "The generators build closed (watertight) solids and the tools check this before download. You still need to open the file in a slicer such as PrusaSlicer, Bambu Studio, OrcaSlicer or Cura to choose print settings.",
  },
  {
    q: "What do I need to run the tools?",
    a: "A recent version of Chrome, Edge, Firefox or Safari with WebGL enabled. Large files and high resolutions need more memory, so a desktop or laptop is more comfortable than a phone.",
  },
  {
    q: "Can I use the models commercially?",
    a: "Models you create belong to you. Make sure you have the rights to any image, logo or SVG you convert; the tool does not check copyright.",
  },
];

export default function Home() {
  const groups = [
    { key: "make", title: "Make printable models", text: "Turn pictures and vector art into solid, print-ready models." },
    { key: "convert", title: "Convert files", text: "Format-specific converters with presets tuned for each input." },
    { key: "view", title: "View and inspect", text: "Open 3D files, measure them and check if they are watertight." },
  ] as const;
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            url: absoluteUrl("/"),
            description: SITE.description,
          },
          faqLd(FAQ),
        ]}
      />
      <section className="border-b border-[var(--border)] bg-gradient-to-b from-brand-50 to-transparent dark:from-brand-700/10">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Free 3D printing tools that run in your browser
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
            Convert images and SVGs to STL, make lithophanes, keychains and cookie cutters, or inspect a model — instantly,
            with no uploads and no account.
          </p>
          <TrustChips />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/image-to-stl" className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700">
              Image to STL
            </Link>
            <Link href="/lithophane-maker" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-semibold hover:border-brand-500">
              Lithophane maker
            </Link>
            <Link href="/stl-viewer" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-3 font-semibold hover:border-brand-500">
              STL viewer
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {groups.map((g) => {
          const items = TOOLS.filter((t) => t.category === g.key);
          if (!items.length) return null;
          return (
            <section key={g.key} className="mb-12" aria-labelledby={`g-${g.key}`}>
              <h2 id={`g-${g.key}`} className="text-2xl font-bold tracking-tight">{g.title}</h2>
              <p className="mt-1 text-[var(--muted)]">{g.text}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </section>
          );
        })}

        <div className="prose-tool max-w-3xl">
          <h2>Why browser-based?</h2>
          <p>
            Most online converters upload your file to a server, put it in a queue and send back a result. These tools do
            the work on your own computer instead. That means results appear as you change settings, there is no daily
            limit, and private files — family photos for a lithophane, an unreleased logo — stay on your device.
          </p>
          <p>
            Every generator produces closed, manifold meshes measured in millimetres, so what you download is ready to drop
            into your slicer. If something is wrong with the input, such as an SVG with no closed shapes, the tool tells you
            what to change rather than producing a broken file.
          </p>
          {GUIDES.length > 0 && (
            <>
              <h2>Guides</h2>
              <ul>
                {GUIDES.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`}>{g.h1}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Faq items={FAQ} />
        </div>
      </div>
    </>
  );
}
