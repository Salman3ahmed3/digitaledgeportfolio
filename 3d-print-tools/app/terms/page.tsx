import { StaticPage } from "@/components/layout/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/site.config";

export const metadata = pageMetadata({ title: "Terms of Use", description: `Terms of use for ${SITE.name}: free browser-based 3D printing tools provided as is, your rights to your files, and food-safety notes.`, path: "/terms" });

export default function Terms() {
  return (
    <StaticPage title="Terms of use" path="/terms" updated="2026-10-12">
      <p>By using {SITE.name} you agree to these terms. Please have them reviewed for your jurisdiction before launch.</p>
      <h2>Use of the tools</h2>
      <p>
        The tools are provided free of charge, as is, without warranty of any kind. Check every model in your slicer before
        printing. We are not responsible for failed prints, damaged equipment or wasted material.
      </p>
      <h2>Your content</h2>
      <p>
        You keep all rights to the files you open and the models you create. You are responsible for having the right to
        use any image, logo, font or design you convert. Do not use the tools to make anything illegal or unsafe.
      </p>
      <h2>Food-contact items</h2>
      <p>
        Cookie cutters and similar items made with consumer 3D printers are not automatically food safe. Use food-safe
        materials and follow appropriate hygiene guidance.
      </p>
      <h2>Changes</h2>
      <p>We may update these terms or change the tools at any time. Continued use means you accept the current version.</p>
    </StaticPage>
  );
}
