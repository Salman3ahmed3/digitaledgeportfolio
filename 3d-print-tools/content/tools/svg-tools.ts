import type { ToolPage } from "../types";

const svgSettings = [
  { name: "Mode", text: "Extrude raises the artwork; Stencil cuts it out of a plate; Keychain adds a backing plate and loop; Cutter builds a cookie-cutter wall around the outline." },
  { name: "Real width", text: "The finished width of the artwork in millimetres (or inches). Height follows the SVG's proportions, so there is no guessing scale in the slicer." },
  { name: "Height", text: "How far shapes are extruded. 2–4 mm suits signs and logos; thinner works for inlays." },
  { name: "Smooth edges", text: "Adds a stepped chamfer to the top edge. Small values (0.3–0.8 mm) soften the look without losing detail." },
  { name: "Base plate", text: "A plate under the artwork that ties separate shapes together. Leave at 0 for loose pieces." },
  { name: "Curve resolution", text: "How finely curves are divided into straight segments. High looks smoothest but makes larger files." },
  { name: "Remove background", text: "Skips a full-size background shape (often a white rectangle) and any colour within the tolerance of it." },
  { name: "Line width / Include strokes", text: "Turns outlines into solid lines. Use Line width to thicken hairline strokes that would be too thin to print." },
  { name: "Layers", text: "One row per colour. Hide colours you don't want, or give each one its own height and Z offset for stepped, multi-colour prints." },
];

const svgFaqCore = [
  { q: "Why is my SVG model empty or missing parts?", a: "The tool builds solids from filled shapes. Outlines (strokes) only become solid when “Include strokes” is on, and very thin strokes may need a larger Line width. Text that hasn't been converted to paths is ignored." },
  { q: "Are my files uploaded?", a: "No. The SVG is read and converted in your browser; it never leaves your device." },
  { q: "Will holes in letters like O, A and B be kept?", a: "Yes. The SVG fill rule (non-zero or even-odd) is respected, so counters in letters and cut-outs in logos stay open." },
];

export const svgToStl: ToolPage = {
  slug: "svg-to-stl",
  engine: "svg",
  category: "convert",
  shortName: "SVG to STL",
  cardText: "Extrude SVG logos and drawings into solid STL models, with layers by colour.",
  title: "SVG to STL Converter — Free, Unlimited, In Your Browser",
  metaDescription:
    "Convert SVG to STL for 3D printing. Set real width in mm, extrude each colour to its own height, add a base, bevel edges, or make stencils. No upload, no limits.",
  h1: "SVG to STL Converter",
  valueLine: "Turn vector logos, icons and drawings into printable 3D models with exact real-world size.",
  intro: [
    "SVG files are ideal for 3D printing because they describe clean, exact shapes instead of pixels. This converter reads those shapes and extrudes them into a solid, watertight STL you can send straight to a slicer.",
    "You control the result in real units. Set the finished width in millimetres and the height follows the artwork's proportions. Each fill colour becomes its own layer, so you can hide a white background, raise lettering above a badge, or stack colours at different heights for filament swaps and multi-colour printers. A base plate joins separate letters into one piece, and a small bevel softens the top edges.",
    "The same engine can also cut the design out of a plate to make a stencil, build a keychain, or make a cookie cutter. Holes in letters and logos are preserved, stroke-only drawings can be given a line width, and everything runs in your browser with no upload or file limit.",
  ],
  howTo: [
    { name: "Open your SVG", text: "Drop an .svg file onto the tool, click to browse, or paste SVG code. Use the sample if you just want to try it." },
    { name: "Set the size", text: "Enter the real width you want. Choose the extrude height and, if needed, a base plate." },
    { name: "Tidy the layers", text: "Check the background was removed, hide colours you don't want, and give layers different heights if you like." },
    { name: "Check the preview", text: "Rotate the model and read the size, triangle count and watertight check under the preview." },
    { name: "Download", text: "Click Download STL, or choose 3MF to keep colours as separate parts." },
  ],
  settings: svgSettings,
  useCases: [
    { title: "Logo signs and badges", text: "Extrude a company or club logo at 3 mm on a 2 mm base for a desk sign, then swap filament at the base height for two colours." },
    { title: "Wall art", text: "Print line drawings and silhouettes as wall decor. Use a thicker line width for stroke-only artwork." },
    { title: "Stencils", text: "Switch to Stencil mode to cut lettering through a thin plate for painting or airbrushing." },
  ],
  printTips: [
    "Make thin details at least two nozzle widths wide (0.8 mm for a 0.4 mm nozzle) or they may disappear in the slicer.",
    "Print flat on the bed with the extruded shapes facing up; no supports are needed.",
    "For two colours, note the base thickness and add a filament change (M600 / colour change) at that layer.",
    "If the outline looks jagged, raise the curve resolution or simplify the SVG in your design app first.",
  ],
  faq: [
    { q: "How do I convert SVG to STL?", a: "Open the SVG on this page, set the real width and height, and click Download STL. The preview shows the exact model you'll get." },
    ...svgFaqCore,
    { q: "Can I convert a PNG or JPG logo with this tool?", a: "This tool needs vector shapes. For raster images use the Image to STL tool, which traces the logo for you." },
    { q: "How do I keep the colours for multi-colour printing?", a: "Download as 3MF. Each colour layer becomes a separate object that slicers like Bambu Studio, PrusaSlicer and OrcaSlicer can assign to different filaments." },
    { q: "Is there a size or conversion limit?", a: "No. There is no daily limit and no file size cap beyond your device's memory." },
  ],
  related: ["image-to-stl", "keychain-maker", "cookie-cutter-maker", "text-to-stl", "svg-to-3mf", "logo-to-stl"],
  convertTo: ["svg-to-obj", "svg-to-3mf"],
  updated: "2026-10-12",
};

export const svgToObj: ToolPage = {
  slug: "svg-to-obj",
  engine: "svg",
  defaultFormat: "obj",
  category: "convert",
  shortName: "SVG to OBJ",
  cardText: "Extrude SVG artwork into an OBJ mesh for Blender, game engines and CAD.",
  title: "SVG to OBJ Converter — Extrude Vector Art to a 3D Mesh",
  metaDescription:
    "Convert SVG to OBJ in your browser. Extrude logos and icons to a set depth with clean, closed geometry for Blender, Unity, CAD or printing. One object per colour.",
  h1: "SVG to OBJ Converter",
  valueLine: "Extrude vector artwork into a clean OBJ mesh with one named object per colour.",
  intro: [
    "Sometimes you need an SVG as 3D geometry outside of a slicer: in Blender for a motion graphic, in a game engine as a logo prop, or in a CAD tool as a starting point. This converter extrudes the SVG and saves it as a Wavefront OBJ, the format almost every 3D application can import.",
    "Each fill colour becomes its own named object in the OBJ, so a two-colour logo arrives as two separate meshes you can assign materials to. Geometry is closed and manifold, which matters if you plan to apply booleans, modifiers or 3D print the result later. Sizes are in millimetres, set by the real width you enter.",
    "The conversion runs locally in your browser, so unreleased logos and client artwork never leave your computer. You can also export the same model as STL, 3MF or GLB from the format menu.",
  ],
  howTo: [
    { name: "Open the SVG", text: "Drop an SVG file or paste SVG code into the tool." },
    { name: "Set width and depth", text: "Enter the real width and extrude height. Add a bevel if you want softer top edges." },
    { name: "Choose layers", text: "Hide the background or any colours you don't need, and set per-layer heights if required." },
    { name: "Download OBJ", text: "OBJ is selected by default. Click Download to save the file." },
  ],
  settings: [
    ...svgSettings.slice(1, 6),
    { name: "Export format", text: "OBJ writes one object per colour layer with vertex positions in millimetres. Switch to GLB if you need materials embedded." },
  ],
  useCases: [
    { title: "Blender motion graphics", text: "Import an extruded client logo into Blender and add materials per colour object." },
    { title: "Game and AR assets", text: "Create a low-poly 3D logo or sign for a Unity or Unreal scene using the Low curve resolution." },
    { title: "CAD starting point", text: "Bring a vector outline into a CAD or modelling app as a solid instead of tracing it again." },
  ],
  printTips: [
    "OBJ has no unit field. Blender imports the model 1000× too large in metres unless you set the import scale to 0.001.",
    "Use Medium or Low curve resolution for real-time use; High creates many more triangles.",
    "If you'll 3D print it later, STL or 3MF is simpler — use the format menu.",
  ],
  faq: [
    { q: "How do I convert SVG to OBJ?", a: "Open the SVG here, set the width and height, and click Download OBJ. Each colour becomes a separate object in the file." },
    { q: "What unit is the OBJ in?", a: "Millimetres. OBJ doesn't store units, so set the import scale in your 3D app if it assumes metres." },
    ...svgFaqCore,
    { q: "Does the OBJ include an MTL file?", a: "No. Objects are named by colour so you can assign materials quickly. Use GLB if you need colours embedded in the file." },
  ],
  related: ["svg-to-stl", "svg-to-3mf", "image-to-obj", "obj-viewer", "text-to-stl"],
  convertFrom: ["svg-to-stl"],
  convertTo: ["svg-to-stl", "svg-to-3mf"],
  updated: "2026-10-12",
};

export const svgTo3mf: ToolPage = {
  slug: "svg-to-3mf",
  engine: "svg",
  defaultFormat: "3mf",
  category: "convert",
  shortName: "SVG to 3MF",
  cardText: "Multi-colour ready: each SVG colour becomes its own 3MF object.",
  title: "SVG to 3MF Converter — Multi-Colour 3D Printing from SVG",
  metaDescription:
    "Convert SVG to 3MF with one object per colour for AMS, MMU and other multi-material printers. Set heights per colour, real width in mm. Free, runs in your browser.",
  h1: "SVG to 3MF for Multi-Colour Printing",
  valueLine: "Every colour in your SVG becomes a separate 3MF object, ready to assign to a filament.",
  intro: [
    "Multi-material printers have made colour prints easy, but getting a logo into the slicer as separate, correctly aligned parts still takes work. 3MF solves this: unlike STL it can hold several objects in one file, with their positions and colours.",
    "This converter reads the colours in your SVG and turns each one into its own extruded object in a single 3MF file. Open it in Bambu Studio, PrusaSlicer or OrcaSlicer, and the parts appear aligned and named by colour, ready to map to filament slots. Give colours different heights or Z offsets for raised details, or add a base plate that every colour sits on.",
    "Background shapes are removed automatically, and you can hide any colour you don't want to print. Everything happens in your browser, with no upload and no limit on how many files you convert.",
  ],
  howTo: [
    { name: "Open a multi-colour SVG", text: "Drop the SVG or paste its code. Each fill colour appears as a layer." },
    { name: "Set size and heights", text: "Enter the real width, the default height, and per-layer heights or offsets if you want raised details." },
    { name: "Add a base (optional)", text: "A base plate gives every colour something to sit on and makes the print one piece." },
    { name: "Download 3MF", text: "Click Download 3MF and open the file in your slicer. Assign a filament to each object." },
  ],
  settings: [
    ...svgSettings.slice(1, 5),
    svgSettings[8],
    { name: "3MF export", text: "Each colour layer is written as a separate, named object with a display colour. The base plate is its own object too." },
  ],
  useCases: [
    { title: "AMS / MMU logo prints", text: "Print a full-colour club badge in one go: each colour is already separated and aligned." },
    { title: "Layered signs", text: "Give lettering a 1 mm Z offset over a coloured background for a stepped, readable sign." },
    { title: "Flat inlays", text: "Use the same height for every colour on a 0.6 mm base for a flat, multi-colour inlay coaster." },
  ],
  printTips: [
    "In your slicer, keep the objects as one assembly so their positions stay aligned.",
    "Thin colour regions under 0.8 mm wide may not print; thicken them in the SVG or remove that colour.",
    "Purge volume adds up with many colours. Merge similar colours in your design app first.",
  ],
  faq: [
    { q: "How do I convert SVG to 3MF?", a: "Open your SVG here, adjust the size and layers, and click Download 3MF. Each colour becomes its own object." },
    { q: "Will my slicer keep the colours?", a: "The objects carry display colours and names. Most slicers show them as separate parts so you can assign filaments; exact behaviour depends on the slicer." },
    ...svgFaqCore,
    { q: "What about gradients?", a: "Gradients can't be printed as one colour. Shapes filled with a gradient are treated as a single grey layer; replace gradients with solid fills for best results." },
  ],
  related: ["svg-to-stl", "svg-to-obj", "image-to-3mf", "keychain-maker", "3mf-viewer"],
  convertFrom: ["svg-to-stl"],
  convertTo: ["svg-to-stl", "svg-to-obj"],
  updated: "2026-10-12",
};

export const keychainMaker: ToolPage = {
  slug: "keychain-maker",
  engine: "svg",
  preset: { mode: "keychain", width: 40, height: 1.2 },
  category: "make",
  shortName: "Keychain Maker",
  cardText: "Logo or name keychains with a plate, keyring loop and raised or engraved art.",
  title: "3D Printed Keychain Maker — Custom Keychain STL from SVG or Text",
  metaDescription:
    "Make a custom keychain STL from an SVG logo or your own text. Choose plate shape, raised, flush or engraved artwork, and a keyring tab or hole. Free, no signup.",
  h1: "Keychain Maker",
  valueLine: "Turn a logo or name into a printable keychain with a sturdy plate and keyring loop.",
  intro: [
    "Keychains are one of the most popular things to 3D print: quick, cheap, and easy to personalise for gifts, events and small businesses. This maker turns any SVG into a keychain in a few clicks, with the details that matter for something you'll carry every day.",
    "Pick a plate shape — rounded rectangle, circle, hexagon, or an outline that follows your design — and set its thickness. The artwork can be raised above the plate, engraved into it, or flush for two-colour inlays. Add a keyring tab outside the plate or a hole inside it, at the top or either side, and choose the hole diameter to fit your split ring.",
    "Sizes are in real millimetres, and every model is checked to be a closed solid before you download it. The whole process runs in your browser; your logo is never uploaded.",
  ],
  howTo: [
    { name: "Open your artwork", text: "Drop an SVG logo or icon onto the tool, or try the sample. For names, use the Text to STL tool's keychain mode." },
    { name: "Size the keychain", text: "Set the artwork width (35–50 mm suits most keyrings) and the plate shape and margin." },
    { name: "Style the artwork", text: "Choose Raised, Flush or Engraved and set the depth." },
    { name: "Add the loop", text: "Pick a tab or inside hole, its position, and a hole diameter that fits your ring." },
    { name: "Download", text: "Download STL for single colour, or 3MF to keep the plate and artwork separate for two colours." },
  ],
  settings: [
    { name: "Plate shape", text: "Rounded rectangle, circle and hexagon frame the artwork; Outline follows the design's silhouette with the chosen margin." },
    { name: "Plate thickness", text: "2.5–3.5 mm is sturdy for keychains. Thinner plates flex and can snap at the loop." },
    { name: "Plate margin", text: "Clearance between the artwork and the plate edge." },
    { name: "Artwork style", text: "Raised sits on top, Engraved cuts into the plate, Flush fills a pocket so the top is level — ideal for two colours." },
    { name: "Artwork height/depth", text: "1–1.5 mm reads well. Engraving depth is limited so at least 0.6 mm of plate remains." },
    { name: "Keyring loop", text: "Tab adds a rounded tab with a hole outside the plate; Inside hole makes room inside the plate." },
    { name: "Hole diameter", text: "4–5 mm fits most split rings and lanyard clips." },
  ],
  useCases: [
    { title: "Business giveaways", text: "Print a batch of logo keychains for an event using the outline plate and raised artwork." },
    { title: "Two-colour name tags", text: "Use Flush artwork and export 3MF to print the plate and lettering in contrasting colours." },
    { title: "School and club tags", text: "Engrave a club crest into a hexagon plate for a durable, single-colour keychain." },
  ],
  printTips: [
    "Print flat with the artwork facing up. PETG is tougher than PLA for keys that get knocked around.",
    "Use at least 3 walls/perimeters so the loop doesn't tear.",
    "For two colours with raised art, add a filament change at the plate-thickness layer.",
  ],
  faq: [
    { q: "What size should a 3D printed keychain be?", a: "Around 35–50 mm wide and 3 mm thick is comfortable and sturdy. Set the width in the tool and the height follows your design." },
    { q: "What hole size do I need for a keyring?", a: "4–5 mm suits most split rings. Use 3 mm for thin chains and 6 mm or more for lanyard clips." },
    { q: "Can I make a keychain with my name?", a: "Yes. Use the Text to STL tool and switch the mode to Keychain, or convert your name to paths in a design app and open the SVG here." },
    { q: "Can I print it in two colours without a multi-material printer?", a: "Yes. With raised artwork, pause or add a colour change at the layer where the plate ends." },
    { q: "Why does my artwork get cut off?", a: "Artwork is clipped to the plate. Increase the plate margin, or choose the Outline shape." },
    { q: "Are my files uploaded?", a: "No. Everything runs in your browser and your design stays on your device." },
  ],
  related: ["text-to-stl", "svg-to-stl", "cookie-cutter-maker", "image-to-stl", "logo-to-stl"],
  updated: "2026-10-12",
};

export const cookieCutterMaker: ToolPage = {
  slug: "cookie-cutter-maker",
  engine: "svg",
  preset: { mode: "cookie", width: 70 },
  category: "make",
  shortName: "Cookie Cutter Maker",
  cardText: "Turn any SVG shape into a cookie cutter with an exact size, wall and flange.",
  title: "Cookie Cutter Maker — Custom 3D Printable Cookie Cutters from SVG",
  metaDescription:
    "Create a custom cookie cutter STL from any SVG shape. Set the exact width in mm, wall thickness, cutting height and a comfortable flange. Free and runs in your browser.",
  h1: "Cookie Cutter Maker",
  valueLine: "Give it a shape, get a printable cookie cutter sized exactly in millimetres.",
  intro: [
    "Custom cookie cutters are a favourite first project: a birthday number, a company logo, a pet silhouette. The hard part is getting the outline thin enough to cut cleanly but strong enough not to snap, at exactly the size you want.",
    "This maker follows the outer silhouette of your SVG and builds a cutting wall around it, plus a wider flange at the base so it's comfortable to press and stays rigid. You set the finished width in millimetres, so a 70 mm cutter is a 70 mm cookie. Wall thickness, cutting height and flange size are all adjustable, and inner details are ignored so the cutter stays a single clean outline.",
    "Every cutter is checked to be a watertight solid before download. Nothing is uploaded — your design is processed on your own device.",
  ],
  howTo: [
    { name: "Open a shape", text: "Drop an SVG with a bold, simple silhouette. Fine details inside the outline are ignored." },
    { name: "Set the size", text: "Enter the cutter width — the size of the cookie — in mm or inches." },
    { name: "Adjust the wall", text: "Keep the wall around 1 mm and the height 12–15 mm for most doughs." },
    { name: "Set the flange", text: "A 3–5 mm flange makes the cutter stiffer and easier to press." },
    { name: "Download and print", text: "Download the STL and print it flange-down." },
  ],
  settings: [
    { name: "Cutter width", text: "The inside width of the cutter, which is the width of the finished cookie." },
    { name: "Wall thickness", text: "0.8–1.2 mm cuts cleanly. Thinner walls cut sharper but are fragile; thicker walls are sturdier but squash soft dough." },
    { name: "Cutter height", text: "12–15 mm works for most rolled doughs. Go taller for thick dough or fondant layers." },
    { name: "Flange width and thickness", text: "The lip around the top that you press on. Wider flanges are stronger and more comfortable." },
    { name: "Remove background / layers", text: "Hide any shapes that shouldn't contribute to the outline, such as a background rectangle." },
  ],
  useCases: [
    { title: "Birthday numbers and letters", text: "Use a bold font converted to paths to make number cutters for a party." },
    { title: "Brand cookies", text: "Turn a simplified logo silhouette into a cutter for a café, launch event or client gift." },
    { title: "Seasonal shapes", text: "Make pumpkins, stars, hearts or trees at exactly the size your recipe needs." },
  ],
  printTips: [
    "Print flange-down with no supports. Two or three walls and 100% infill for the thin wall give the best strength.",
    "Consumer 3D prints have tiny gaps where bacteria can collect. Use food-safe filament, wash by hand, and consider single-use for raw dough.",
    "Avoid outlines with very sharp inside corners — dough sticks in them. Rounder shapes release more easily.",
  ],
  faq: [
    { q: "How thick should a cookie cutter wall be?", a: "Around 0.8–1.2 mm with a 0.4 mm nozzle. That's thin enough to cut cleanly and thick enough to print reliably." },
    { q: "How tall should a cookie cutter be?", a: "12–15 mm is typical. Taller cutters are needed for thick dough or stacked fondant." },
    { q: "Are 3D printed cookie cutters food safe?", a: "Not automatically. Use a food-safe filament, keep the printer's nozzle clean, avoid rough surfaces, and many bakers use printed cutters only briefly with dough." },
    { q: "Why are the details inside my design missing?", a: "A cutter only follows the outer silhouette. Inside details would need a separate stamp; this version focuses on the outline." },
    { q: "Can I use a PNG instead of an SVG?", a: "Use the Image to STL tool to trace a PNG, or convert the image to SVG first and open it here." },
    { q: "Are my files uploaded?", a: "No. The cutter is generated in your browser." },
  ],
  related: ["keychain-maker", "svg-to-stl", "image-to-stl", "text-to-stl"],
  updated: "2026-10-12",
};

export const textToStl: ToolPage = {
  slug: "text-to-stl",
  engine: "svg",
  preset: { source: "text", width: 100, height: 4 },
  category: "make",
  shortName: "Text to STL",
  cardText: "Type text, pick a font, get a 3D printable sign, label or name tag.",
  title: "Text to STL — 3D Text Generator for Signs, Names and Labels",
  metaDescription:
    "Turn text into a 3D printable STL. Choose a font, real width, height and base plate, or make a name keychain or stencil. Multi-line text supported. Free, no signup.",
  h1: "Text to STL Generator",
  valueLine: "Type a word or name, pick a font, and download it as a solid 3D model.",
  intro: [
    "3D text is everywhere in printing: name plates, shelf labels, cake toppers, door signs and personalised keychains. Making it usually means opening CAD software and fiddling with fonts and extrusions. This generator does it directly in your browser.",
    "Type one or more lines of text, pick from the bundled open-licence fonts — a clean sans, a condensed display face and a script — and set the finished width in millimetres. Extrude it, add a base plate so separate letters print as one piece, or soften the top edges with a bevel. Switch the mode to make a keychain with a loop, a stencil, or even a cookie cutter from a word.",
    "Letters keep their holes, kerning is applied, and multi-line text is centred. The model is checked to be watertight before you download it, and nothing you type leaves your device.",
  ],
  howTo: [
    { name: "Type your text", text: "Enter one or more lines. Short words work best for keychains; longer text suits signs." },
    { name: "Choose a font", text: "Pick sans, condensed or script. Script fonts join letters, which makes one solid piece." },
    { name: "Set the size", text: "Enter the real width, the letter height (extrusion) and an optional base plate." },
    { name: "Pick a mode", text: "Keep Extrude for signs, or switch to Keychain, Stencil or Cutter." },
    { name: "Download", text: "Download STL, or 3MF to keep the base and text as separate parts for two colours." },
  ],
  settings: [
    { name: "Text and font", text: "Multi-line text is centred. Fonts are bundled under the SIL Open Font License, so they're free to use in your prints." },
    { name: "Letter spacing", text: "Adds or removes space between letters. Slightly wider spacing helps small text print cleanly." },
    { name: "Real width", text: "The width of the longest line in millimetres; height follows the font proportions." },
    { name: "Height", text: "How tall the letters stand. 3–5 mm is readable from a distance." },
    { name: "Base plate", text: "Joins letters into one piece. Without a base, letters print as separate parts (except joined script)." },
    { name: "Mode", text: "Extrude, Stencil, Keychain or Cookie cutter — the same options as the SVG tool." },
  ],
  useCases: [
    { title: "Desk and door name plates", text: "Raised text on a 2 mm base, printed in two colours with a filament change." },
    { title: "Personalised keychains", text: "Switch to Keychain mode, choose the outline plate and add a tab for the ring." },
    { title: "Labels and tags", text: "Make small labels for storage bins, plant markers or cable tags." },
  ],
  printTips: [
    "Keep the thinnest stroke of each letter above about 0.8 mm. If a font looks too thin at your size, increase the width or choose the sans font.",
    "Print flat, text facing up. Lettering on a base needs no supports.",
    "For two-colour signs, change filament at the first layer above the base thickness.",
  ],
  faq: [
    { q: "How do I make 3D text for printing?", a: "Type your text here, choose a font, set the width and height, and click Download STL." },
    { q: "Can I use my own font?", a: "Not in this version. You can set your text in any font in a design app, convert it to paths, save as SVG and open it in the SVG to STL tool." },
    { q: "Why are some letters separate pieces?", a: "Most fonts have separate letters. Add a base plate to join them, or use the script font." },
    { q: "Can I write on more than one line?", a: "Yes. Press Enter for a new line; lines are centred." },
    { q: "Which characters are supported?", a: "Latin letters, numbers and common punctuation in the bundled fonts. Characters a font doesn't include are skipped." },
    { q: "Is the font licence OK for selling prints?", a: "The bundled fonts use the SIL Open Font License, which allows using them in products you make and sell." },
  ],
  related: ["keychain-maker", "svg-to-stl", "cookie-cutter-maker", "image-to-stl", "lithophane-maker"],
  updated: "2026-10-12",
};

export const svgPages: ToolPage[] = [svgToStl, svgToObj, svgTo3mf, keychainMaker, cookieCutterMaker, textToStl];
