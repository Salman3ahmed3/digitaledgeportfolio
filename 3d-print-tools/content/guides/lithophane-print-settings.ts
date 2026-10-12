import type { Guide } from "../types";

export const lithophanePrintSettings: Guide = {
  slug: "lithophane-print-settings",
  title: "Lithophane Print Settings: Infill, Layer Height, Orientation",
  metaDescription:
    "The slicer settings that matter for lithophanes: white PLA, 100% infill, fine layers, slow outer walls and the right orientation for flat, curved and cylinder lithophanes.",
  h1: "Lithophane print settings that actually work",
  summary:
    "A lithophane is just a thin relief: the picture comes from how much light gets through each spot. These are the slicer settings that keep that thickness accurate.",
  updated: "2026-10-12",
  sections: [
    {
      heading: "Why settings matter more than usual",
      body: [
        "In a lithophane, thickness is the image. A spot that is 0.6 mm thick looks almost white when lit; a spot that is 3 mm thick looks dark. Anything that changes the real thickness of the print — gaps in infill, layer lines, under-extrusion — shows up as noise in the picture.",
        "So the goal of every setting below is simple: make the printed part solid and the surface follow the model as closely as possible.",
      ],
    },
    {
      heading: "Recommended starting settings",
      body: ["These are starting points for a 0.4 mm nozzle on a typical FDM printer. Tune from there."],
      table: [
        ["Setting", "Starting value", "Why"],
        ["Material", "White or natural PLA", "Pure white gives the most even light; colours tint and reduce contrast."],
        ["Infill", "100%", "Any gap inside the part becomes a visible blotch when lit."],
        ["Layer height", "0.12 mm (0.08–0.16 mm)", "Finer layers give smoother tone steps, at the cost of time."],
        ["Walls / perimeters", "3 or more", "Helps the thin areas print as solid plastic."],
        ["Outer wall speed", "20–30 mm/s", "Slow walls keep the fine relief accurate."],
        ["Seam position", "Back or aligned", "Keeps the seam away from faces and focal points."],
        ["Supports", "Off for flat and curved", "Upright lithophanes don't need them."],
        ["Brim", "5–8 mm for upright prints", "Tall, thin parts can tip over or wobble."],
      ],
    },
    {
      heading: "Orientation by shape",
      body: [
        "Most lithophanes print best standing upright, so the layer lines run horizontally across the picture and the nozzle traces the relief in fine steps. Printing face down is faster and sturdier but turns each thickness level into a visible flat terrace.",
      ],
      list: [
        "Flat panel: stand it upright on its bottom edge. Use a brim, or add the stand option in the lithophane maker for a wider footprint.",
        "Curved: stand it upright; the curve itself makes it stable.",
        "Cylinder: print standing on its base. If you added a bottom ring with a light hole, it becomes the first layers.",
        "Heart and circle: upright with a brim, or face down if the design has a frame that would need support.",
      ],
    },
    {
      heading: "Choosing thickness",
      body: [
        "The two numbers that control contrast are minimum and maximum thickness. The thinnest areas (highlights) should still be solid: 0.6–0.8 mm is a safe minimum with a 0.4 mm nozzle. The thickest areas (shadows) should block most light: 2.5–3.2 mm works for most white PLA.",
        "If your print looks washed out, increase the maximum thickness or the contrast in the image. If it looks muddy and dark, reduce the maximum or brighten the photo.",
      ],
    },
    {
      heading: "Lighting it",
      body: [
        "Use a diffuse, warm-white light source a few centimetres behind the print. LED strips or a puck light with a sheet of paper in front work well. Bare point LEDs create hot spots. For cylinders, a battery tea light or a small LED bulb inside works well; avoid real flames.",
      ],
    },
  ],
  faq: [
    {
      q: "What infill should I use for a lithophane?",
      a: "100%. Partial infill leaves air gaps that show up as patterns when the print is lit from behind.",
    },
    {
      q: "Should I print a lithophane flat or standing up?",
      a: "Standing up usually gives the best detail because the nozzle traces the relief in fine vertical steps. Printing flat is faster but can show stepped tone bands.",
    },
    {
      q: "Can I use PETG or coloured filament?",
      a: "Yes, but white PLA is the easiest to get good results with. Translucent and coloured filaments change how light passes through, so you may need to adjust thickness.",
    },
  ],
  relatedTools: ["lithophane-maker", "stl-viewer"],
};
