import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/site.config";

export const metadata = pageMetadata({
  title: "About",
  description: `What ${SITE.name} is, how the tools work, and how the site is funded.`,
  path: "/about",
});

export default function About() {
  return (
    <StaticPage title={`About ${SITE.name}`} path="/about">
      <p>
        {SITE.name} is a set of free tools for people who 3D print: makers, teachers, small shops and anyone who wants to
        turn a picture, logo or SVG into something they can hold.
      </p>
      <h2>How it works</h2>
      <p>
        Every tool runs inside your web browser. When you open a file, your device reads it, builds the 3D model using
        WebGL, Web Workers and WebAssembly, and saves the result straight to your downloads folder. Our server only sends
        the web pages and program code; it never receives your files.
      </p>
      <h2>How the site is funded</h2>
      <p>
        The tools are free and unlimited. The site shows a small number of clearly labelled display ads below the tools.
        The tools keep working if you use an ad blocker.
      </p>
      <h2>Feedback</h2>
      <p>
        Found a file that does not convert well, or have an idea for a tool? <Link href="/contact">Get in touch</Link>.
      </p>
    </StaticPage>
  );
}
