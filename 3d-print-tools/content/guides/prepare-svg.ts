import type { Guide } from "../types";

export const prepareSvg: Guide = {
  slug: "prepare-svg-for-3d-printing",
  title: "How to Prepare an SVG for 3D Printing (Inkscape, Illustrator, Figma)",
  metaDescription:
    "Get clean 3D prints from SVG files: convert text and strokes to paths, remove backgrounds, fix open shapes and thin details. Step-by-step for Inkscape, Illustrator and Figma.",
  h1: "How to prepare an SVG for 3D printing",
  summary:
    "Most SVG problems in 3D printing come from four things: live text, hairline strokes, background shapes and details smaller than your nozzle. Here's how to fix each one.",
  updated: "2026-10-12",
  sections: [
    {
      heading: "What a converter actually reads",
      body: [
        "An SVG to STL converter builds solids from filled shapes. It reads each path's outline, uses the fill rule to work out which areas are inside (so the hole in an “O” stays a hole), and extrudes the result. Anything that isn't a filled shape needs extra handling: strokes need a width, text needs to become outlines, and effects like blur or shadows are ignored.",
      ],
    },
    {
      heading: "1. Convert text to paths",
      body: [
        "Live text in an SVG depends on fonts installed on your computer, so converters can't rely on it. Convert it to outlines before exporting.",
      ],
      list: [
        "Inkscape: select the text, then Path → Object to Path.",
        "Illustrator: select the text, then Type → Create Outlines.",
        "Figma: right-click the text layer and choose Outline stroke / Flatten, or use Vector → Flatten.",
      ],
    },
    {
      heading: "2. Turn hairline strokes into shapes",
      body: [
        "A 0.25 pt stroke looks fine on screen but is far thinner than a 0.4 mm nozzle. Either convert strokes to filled shapes (Inkscape: Path → Stroke to Path; Illustrator: Object → Path → Outline Stroke) or use the Line width setting in the converter to give every stroke a printable thickness, such as 1 mm.",
      ],
    },
    {
      heading: "3. Remove or mark the background",
      body: [
        "Logos are often exported with a white rectangle behind them. Printed as-is, that rectangle becomes a solid slab that hides everything else. Delete it, or rely on the converter's background removal, which skips a full-size shape at the bottom of the drawing and any colour within a tolerance of it.",
      ],
    },
    {
      heading: "4. Check minimum feature size",
      body: [
        "Decide the real size of your print first, then check the thinnest parts at that size. With a 0.4 mm nozzle, aim for details at least 0.8 mm wide and gaps at least 0.5 mm. If a tagline or fine outline is thinner, enlarge the print, thicken it, or remove it.",
      ],
      table: [
        ["Nozzle", "Minimum line width", "Minimum gap"],
        ["0.25 mm", "0.5 mm", "0.3 mm"],
        ["0.4 mm", "0.8 mm", "0.5 mm"],
        ["0.6 mm", "1.2 mm", "0.7 mm"],
      ],
    },
    {
      heading: "5. Use colours as layers",
      body: [
        "Each fill colour becomes a layer in the SVG tools on this site, so colour is a convenient way to plan a print. Use one colour per height or filament, merge near-identical shades, and replace gradients with solid fills. For multi-colour printers, export to 3MF to keep each colour as a separate object.",
      ],
    },
    {
      heading: "6. Simplify very complex paths",
      body: [
        "Auto-traced artwork can contain tens of thousands of tiny segments. They add file size without visible detail. Inkscape's Path → Simplify (Ctrl+L) or Illustrator's Object → Path → Simplify reduce them; a lower curve resolution in the converter has a similar effect.",
      ],
    },
  ],
  faq: [
    { q: "Why does my SVG convert to an empty model?", a: "Usually because everything is a stroke or live text. Convert text to paths and give strokes a width (or set Line width in the converter)." },
    { q: "Why are the holes in my letters filled in?", a: "The fill rule or path direction is off. Combine the letter and its counter into one compound path in your editor, then export again." },
    { q: "What SVG export settings should I use?", a: "Plain SVG (not Inkscape SVG with editor data is fine too), with text converted to paths and no embedded raster images." },
  ],
  relatedTools: ["svg-to-stl", "svg-to-3mf", "keychain-maker", "cookie-cutter-maker"],
};
