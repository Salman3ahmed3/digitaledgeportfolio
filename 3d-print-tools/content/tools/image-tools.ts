import type { ToolPage } from "../types";

const heightmapSettings = [
  { name: "Mode", text: "Heightmap turns brightness into height for photos and textures. Extrude traces the image into outlines for logos and icons." },
  { name: "Width", text: "Finished width in mm or inches; the other side follows the image's aspect ratio." },
  { name: "Image resolution", text: "The image is downscaled to this long edge before converting. 800 px is a good balance; 2000 px is very detailed but slow and large." },
  { name: "Max / min height", text: "The height range of the relief above the base. White pixels reach the max height, black pixels the min (flip with Invert)." },
  { name: "Base thickness", text: "A solid slab under the relief. 1–2 mm keeps thin areas printable." },
  { name: "Depth curve", text: "Shapes how brightness maps to height. Ease in adds detail to bright areas, ease out to dark areas, and gamma gives full control." },
  { name: "Smoothing", text: "Blurs the image slightly before converting, which removes noise and sharp spikes from photos." },
  { name: "Detail", text: "Low, Medium or High mesh density. Higher detail keeps fine texture but creates larger files." },
  { name: "Invert / Mirror", text: "Invert makes dark areas high. Mirror flips the model left-to-right, useful for stamps." },
];

const extrudeSettings = [
  { name: "Threshold", text: "Pixels darker than the threshold become the shape. Automatic picks a value from the image's histogram (Otsu's method)." },
  { name: "Remove background colour", text: "Instead of a brightness threshold, keep every pixel that differs from the background colour. The corner colour is detected automatically; pick another if needed." },
  { name: "Remove specks", text: "Drops tiny islands and holes caused by JPEG noise or anti-aliasing." },
  { name: "Outline smoothing and simplification", text: "Rounds off pixel staircase edges and removes unnecessary points so curves print smoothly." },
  { name: "Extrude height / By brightness", text: "Give the whole shape one height, or split it into brightness levels so darker parts stand taller." },
  { name: "Base and keyring loop", text: "Add a rectangle or outline base under the shape, and an optional keyring tab with a hole." },
];

const imageFaqCore = [
  { q: "Are my images uploaded?", a: "No. Your image is decoded and converted in your own browser. Nothing is sent to a server." },
  { q: "Is there a limit on conversions or file size?", a: "No. It's free and unlimited. Very large images are downscaled to the resolution you choose so your browser doesn't run out of memory." },
];

export const imageToStl: ToolPage = {
  slug: "image-to-stl",
  engine: "image",
  category: "convert",
  shortName: "Image to STL",
  cardText: "Turn PNG, JPG or WebP into a 3D relief or a traced, extruded logo.",
  title: "Image to STL Converter — PNG, JPG & WebP to 3D Model, Free",
  metaDescription:
    "Convert an image to STL in your browser. Make a heightmap relief from a photo or trace and extrude a logo, with base, keyring loop and exact size. Free and private.",
  h1: "Image to STL Converter",
  valueLine: "Turn a photo into a 3D relief, or a logo into a solid shape — right in your browser.",
  intro: [
    "There are two common ways to make a 3D printable model from a flat picture, and this converter does both. Heightmap mode treats brightness as height: light areas rise and dark areas sink, which turns photos, textures and terrain maps into tactile reliefs and embossed plaques. Extrude mode traces the image into clean outlines and gives them thickness, which is what you want for logos, icons, silhouettes and signs.",
    "Both modes produce a closed, watertight STL sized in real millimetres. In heightmap mode you choose the height range, base, depth curve and smoothing; in extrude mode you control the threshold or background colour, speck removal, outline smoothing, and add a base or keyring loop.",
    "Every change updates the 3D preview within a moment, because all processing happens on your own device. There is no upload, no queue and no daily limit. Drop an SVG instead and the tool switches to the vector engine automatically.",
  ],
  howTo: [
    { name: "Choose your image", text: "Drop a PNG, JPG or WebP, click to browse, or paste an image from your clipboard." },
    { name: "Pick a mode", text: "Heightmap for photos and textures; Extrude for logos and shapes with clear edges." },
    { name: "Set size and height", text: "Enter the width in mm and adjust the height, base and other settings while watching the preview." },
    { name: "Check the model", text: "Confirm the dimensions, triangle count and watertight check below the preview." },
    { name: "Download", text: "Download a binary STL, or choose 3MF or OBJ from the format menu." },
  ],
  settings: [...heightmapSettings, ...extrudeSettings],
  useCases: [
    { title: "Photo relief plaque", text: "Turn a landscape or pet photo into a textured wall plaque with a 2 mm base and 4 mm of relief." },
    { title: "Logo sign from a PNG", text: "Trace a dark logo on a white background and extrude it 3 mm on an outline base." },
    { title: "Texture stamps", text: "Convert a seamless texture to a mirrored heightmap for clay or leather stamping." },
  ],
  printTips: [
    "Print reliefs flat with 0.12–0.16 mm layers to capture fine height changes.",
    "For heightmaps, smoothing of 1–2 px usually gives a cleaner surface than the raw photo.",
    "Thin traced details need to be at least two nozzle widths wide; increase the width or remove specks if they vanish.",
    "If you want light to shine through a photo, use the Lithophane Maker instead — it's tuned for that.",
  ],
  faq: [
    { q: "How do I convert an image to STL?", a: "Drop the image on this page, choose Heightmap or Extrude, set the width and height, and click Download STL." },
    { q: "Can I convert a JPG logo to STL?", a: "Yes. Use Extrude mode. JPG compression adds noise around edges, so raise “Remove specks” and outline smoothing for clean results." },
    { q: "Why is my STL a flat slab with bumps instead of a logo?", a: "You're in Heightmap mode, which turns brightness into height. Switch to Extrude to trace the logo's outline." },
    { q: "Why is my STL hollow or full of holes?", a: "Exports from this tool are closed solids. If a slicer shows gaps, the shapes are probably thinner than your nozzle; increase the width, base or line thickness." },
    { q: "What image size works best?", a: "Around 800–1200 px on the long edge is plenty for most prints. More pixels add file size faster than visible detail." },
    ...imageFaqCore,
    { q: "Should I use this or the lithophane maker for photos?", a: "Use this for reliefs viewed from the front. Use the lithophane maker for prints that show the photo when lit from behind." },
  ],
  related: ["lithophane-maker", "svg-to-stl", "logo-to-stl", "keychain-maker", "png-to-stl", "jpg-to-stl"],
  convertFrom: ["png-to-stl", "jpg-to-stl", "webp-to-stl"],
  convertTo: ["image-to-obj", "image-to-3mf"],
  updated: "2026-10-12",
};

export const pngToStl: ToolPage = {
  slug: "png-to-stl",
  engine: "image",
  preset: { mode: "extrude" },
  category: "convert",
  shortName: "PNG to STL",
  cardText: "Transparent PNGs trace cleanly into extruded shapes — or use heightmap mode.",
  title: "PNG to STL Converter — Transparent PNG to 3D Model",
  metaDescription:
    "Convert PNG to STL free. Transparent backgrounds are removed automatically, outlines are traced and extruded to exact mm sizes. Heightmap mode for reliefs too.",
  h1: "PNG to STL Converter",
  valueLine: "Transparent PNG logos and icons become clean, solid 3D shapes in seconds.",
  intro: [
    "PNG is the best raster format to start a 3D print from. It is lossless, so edges stay crisp, and it supports transparency, which tells the converter exactly which pixels are part of the design. Exported logos, icons, stickers and clip art are usually PNGs for that reason.",
    "This page opens in Extrude mode, tuned for that kind of file. Transparent pixels are always treated as background, so a logo exported with a transparent background traces perfectly with no threshold fiddling. Outlines are smoothed to remove pixel steps and scaled so the finished shape is exactly the width you type in. Add a base plate, stack brightness levels for a multi-height look, or attach a keyring loop.",
    "If your PNG is a photo or a greyscale heightmap rather than a logo, switch to Heightmap mode and brightness becomes height. Either way, the conversion runs entirely in your browser.",
  ],
  howTo: [
    { name: "Open the PNG", text: "Drop a PNG, browse for one, or paste it from your clipboard." },
    { name: "Check the trace", text: "Transparent areas are removed automatically. For a solid background, turn on background removal or adjust the threshold." },
    { name: "Size it", text: "Set the width in mm and the extrude height. Add a base or keyring loop if you want." },
    { name: "Download STL", text: "Download the STL, or 3MF to keep the base and shape separate for two colours." },
  ],
  settings: [extrudeSettings[0], extrudeSettings[1], extrudeSettings[2], extrudeSettings[3], extrudeSettings[4], extrudeSettings[5], heightmapSettings[2]],
  useCases: [
    { title: "Transparent logos", text: "A logo exported as a transparent PNG traces in one step — no background removal needed." },
    { title: "Stickers and emoji", text: "Turn sticker art into fridge magnets or badges using the outline base option." },
    { title: "Greyscale heightmaps", text: "Switch to Heightmap mode to turn a 16-bit-style terrain or displacement PNG into a relief." },
  ],
  printTips: [
    "Export your PNG at least 800 px wide so small details survive tracing.",
    "Semi-transparent edges count as background below 50% opacity, which keeps outlines tight.",
    "Use an outline base with 2–3 mm margin to join separate letters into one printable piece.",
  ],
  faq: [
    { q: "How do I convert PNG to STL?", a: "Drop the PNG on this page, check the traced shape in the preview, set the width and height, and click Download STL." },
    { q: "Does it support transparent PNGs?", a: "Yes. Transparent pixels are always treated as background, which is the easiest way to get a clean trace." },
    { q: "My PNG has a white background. What should I do?", a: "Leave automatic threshold on for dark artwork on white, or turn on background removal for coloured artwork." },
    { q: "Can I make a PNG into a relief instead?", a: "Yes. Switch the mode to Heightmap and brightness becomes height." },
    ...imageFaqCore,
    { q: "Why do my letters print as separate pieces?", a: "Each letter is its own shape. Add a rectangle or outline base to join them." },
  ],
  related: ["image-to-stl", "logo-to-stl", "jpg-to-stl", "svg-to-stl", "keychain-maker"],
  convertFrom: ["image-to-stl"],
  convertTo: ["image-to-obj", "image-to-3mf"],
  updated: "2026-10-12",
};

export const jpgToStl: ToolPage = {
  slug: "jpg-to-stl",
  engine: "image",
  preset: { mode: "heightmap", smoothing: 1 },
  category: "convert",
  shortName: "JPG to STL",
  cardText: "Turn JPG photos into textured 3D reliefs with noise-reducing smoothing.",
  title: "JPG to STL Converter — Turn Photos into 3D Reliefs",
  metaDescription:
    "Convert JPG or JPEG photos to STL reliefs in your browser. Brightness becomes height, with smoothing to remove JPEG noise, a solid base and exact mm sizing.",
  h1: "JPG to STL Converter",
  valueLine: "Turn a JPEG photo into a textured, printable 3D relief — no upload needed.",
  intro: [
    "Most photos are JPGs, and most people converting a JPG to STL want to feel the picture: an embossed portrait, a landscape plaque, a textured coaster. This page opens in Heightmap mode, where brightness becomes height, with light smoothing switched on.",
    "That smoothing matters for JPEGs. The compression that keeps photo files small also adds blocky noise and ringing around edges, which a heightmap faithfully turns into spiky, rough surfaces. A 1–2 px blur before converting removes that noise while keeping the shapes you care about. You can then shape the relief with the depth curve, set the height range and base thickness, and choose how dense the mesh should be.",
    "Have a JPG logo instead of a photo? Switch to Extrude mode and the image is traced into outlines, with speck removal to clean up compression artefacts. Everything happens in your browser.",
  ],
  howTo: [
    { name: "Open the JPG", text: "Drop a .jpg or .jpeg file onto the tool, browse, or paste a photo." },
    { name: "Shape the relief", text: "Set the width, max height and base. Use Invert if you want dark areas raised." },
    { name: "Clean it up", text: "Increase smoothing for noisy photos, and try the depth curve to bring out shadows or highlights." },
    { name: "Download", text: "Download STL, or choose 3MF or OBJ." },
  ],
  settings: heightmapSettings,
  useCases: [
    { title: "Embossed portraits", text: "Raise a high-contrast portrait 3 mm on a 1.5 mm base for a tactile keepsake." },
    { title: "Landscape plaques", text: "Turn a mountain photo into a relief where bright snow peaks stand highest." },
    { title: "Tactile graphics", text: "Make simple diagrams or maps touchable for visually impaired readers." },
  ],
  printTips: [
    "Increase contrast in a photo editor first — reliefs look flat when the photo is mostly mid-grey.",
    "Print with fine layers (0.12 mm) and light lighting from the side to show the relief.",
    "Use Medium detail for prints under 150 mm wide; High rarely shows extra detail at that size.",
  ],
  faq: [
    { q: "How do I convert a JPG to STL?", a: "Drop the JPG on this page, adjust width and height, and click Download STL. The relief preview updates as you go." },
    { q: "Why does my JPG relief look spiky?", a: "That's JPEG compression noise turned into height. Increase Smoothing to 1–3 px." },
    { q: "Can I convert a JPG logo to STL?", a: "Yes — switch to Extrude mode. Raise “Remove specks” to clean up compression artefacts around the edges." },
    { q: "Do bright or dark areas end up higher?", a: "Bright areas are higher by default. Turn on Invert to make dark areas higher." },
    ...imageFaqCore,
    { q: "Is JPG to STL the same as a lithophane?", a: "Not quite. A relief is viewed from the front; a lithophane is thin and shows the photo when light shines through. Use the Lithophane Maker for that." },
  ],
  related: ["image-to-stl", "lithophane-maker", "png-to-stl", "webp-to-stl", "logo-to-stl"],
  convertFrom: ["image-to-stl"],
  convertTo: ["image-to-obj", "image-to-3mf"],
  updated: "2026-10-12",
};

export const webpToStl: ToolPage = {
  slug: "webp-to-stl",
  engine: "image",
  preset: { mode: "heightmap", smoothing: 0.5 },
  category: "convert",
  shortName: "WebP to STL",
  cardText: "Convert WebP images from the web straight to STL — no format conversion first.",
  title: "WebP to STL Converter — Convert WebP Images to 3D Models",
  metaDescription:
    "Convert WebP images to STL without converting to PNG first. Make a heightmap relief or trace and extrude a shape. Transparent WebP supported. Free, in-browser.",
  h1: "WebP to STL Converter",
  valueLine: "Use WebP images saved from the web directly — no need to convert them to PNG first.",
  intro: [
    "WebP is now the default image format on many websites, so images you save from the web often arrive as .webp files. Many converters and older apps still refuse them, which means an extra conversion step before you can make anything.",
    "This tool reads WebP directly using your browser's own decoder, including transparent and animated WebP (the first frame is used). From there you have both conversion modes: Heightmap turns brightness into a textured relief, and Extrude traces shapes into clean outlines with a solid thickness. Transparent areas are treated as background, so web icons with transparency trace cleanly.",
    "As with every tool on this site, the image is processed on your own device. Set the width in millimetres, adjust height and base, and download an STL that's ready for your slicer.",
  ],
  howTo: [
    { name: "Open the WebP", text: "Drop a .webp file, browse for it, or paste an image copied from a web page." },
    { name: "Choose a mode", text: "Heightmap for photos and textures, Extrude for icons and logos." },
    { name: "Adjust", text: "Set the width, height and base, then fine-tune smoothing or threshold." },
    { name: "Download", text: "Download STL, 3MF or OBJ." },
  ],
  settings: [heightmapSettings[0], heightmapSettings[1], heightmapSettings[2], heightmapSettings[3], heightmapSettings[4], heightmapSettings[6], extrudeSettings[0], extrudeSettings[2]],
  useCases: [
    { title: "Images saved from the web", text: "Product photos and illustrations saved as WebP can be turned into reliefs without another app." },
    { title: "Transparent web icons", text: "WebP icons with transparency trace into extruded shapes for badges and magnets." },
    { title: "Quick prototypes", text: "Grab a reference image and make a test relief to check scale before modelling properly." },
  ],
  printTips: [
    "Web images are often small. Keep the print size modest or details will look soft.",
    "Only use images you have the right to reproduce.",
    "For transparent icons, Extrude mode with an outline base gives a sturdy single piece.",
  ],
  faq: [
    { q: "How do I convert WebP to STL?", a: "Drop the WebP file here, choose Heightmap or Extrude, set the size and click Download STL." },
    { q: "Do I need to convert WebP to PNG first?", a: "No. The tool reads WebP directly in your browser." },
    { q: "Does it work with animated WebP?", a: "Yes, the first frame is used." },
    { q: "Is transparency supported?", a: "Yes. Transparent pixels are treated as background in Extrude mode and as white in Heightmap mode." },
    ...imageFaqCore,
    { q: "Which browsers support WebP?", a: "All current versions of Chrome, Edge, Firefox and Safari decode WebP." },
  ],
  related: ["image-to-stl", "png-to-stl", "jpg-to-stl", "lithophane-maker"],
  convertFrom: ["image-to-stl"],
  convertTo: ["image-to-obj", "image-to-3mf"],
  updated: "2026-10-12",
};

export const logoToStl: ToolPage = {
  slug: "logo-to-stl",
  engine: "image",
  preset: { mode: "extrude", logoBase: "outline", outlineSmooth: 2, minSpeck: 40 },
  category: "make",
  shortName: "Logo to STL",
  cardText: "Trace a logo image into a clean 3D sign, badge or keychain.",
  title: "Logo to STL — Turn a Logo Image into a 3D Printable Sign",
  metaDescription:
    "Turn a PNG or JPG logo into a 3D printable STL. Automatic tracing, background removal, smooth outlines, base plate and keyring loop. Free, private, in your browser.",
  h1: "Logo to STL Maker",
  valueLine: "Trace your logo into a smooth, solid 3D sign or badge — even from a JPG.",
  intro: [
    "Most businesses don't have their logo as a vector file to hand; they have a PNG from the website or a JPG from an email signature. This tool is built for exactly that situation: it traces a raster logo into clean outlines and extrudes it into a printable sign, badge or keychain.",
    "It starts with settings tuned for logos: an outline base that joins separate letters, heavier outline smoothing to remove pixel steps, and speck removal to clean up JPEG noise. For coloured logos on a coloured background, turn on background removal and the corner colour is detected for you. Give darker colours more height with brightness levels, and add a keyring loop for giveaways.",
    "Your logo never leaves your device, which matters for unreleased brands and client work. If you do have an SVG, drop that instead — the tool switches to the vector engine for perfectly crisp edges.",
  ],
  howTo: [
    { name: "Open the logo", text: "Drop a PNG, JPG or WebP logo. If you have an SVG, use that for the cleanest result." },
    { name: "Check the trace", text: "Dark-on-light logos work automatically. For coloured backgrounds, turn on background removal." },
    { name: "Size and base", text: "Set the width and extrude height. The outline base joins everything into one piece." },
    { name: "Add extras", text: "Use brightness levels for a stepped look, or add a keyring loop." },
    { name: "Download", text: "Download STL for one colour, or 3MF to keep base and logo separate." },
  ],
  settings: [...extrudeSettings, heightmapSettings[1], heightmapSettings[2]],
  useCases: [
    { title: "Desk and shelf signs", text: "A 150 mm logo, 4 mm tall on a 2 mm outline base, printed in two colours." },
    { title: "Branded keychains", text: "A 45 mm logo with a keyring loop for events and giveaways." },
    { title: "Wall logos", text: "Print a large logo in sections and mount it as office wall art." },
  ],
  printTips: [
    "Use the largest version of the logo you have; tracing a 200 px favicon gives blobby results.",
    "Change filament at the base thickness for an instant two-colour sign.",
    "Thin taglines often won't print at small sizes — hide them or make the sign bigger.",
  ],
  faq: [
    { q: "How do I turn my logo into an STL?", a: "Drop the logo image here, check the traced preview, set the size, and click Download STL." },
    { q: "Can I convert a JPG logo to STL?", a: "Yes. Speck removal and outline smoothing clean up JPEG artefacts. A PNG or SVG gives better edges if you have one." },
    { q: "My logo is white on a dark background. What do I do?", a: "Turn on Invert under Detect shape, or use background removal." },
    { q: "How do I get crisp, sharp corners?", a: "Lower outline smoothing to 0–1, or use the original SVG with the SVG to STL tool." },
    ...imageFaqCore,
    { q: "Do I need permission to print a logo?", a: "If it isn't your logo, you need the owner's permission to reproduce it, especially for anything you sell." },
  ],
  related: ["svg-to-stl", "image-to-stl", "keychain-maker", "png-to-stl", "text-to-stl"],
  updated: "2026-10-12",
};

export const imageToObj: ToolPage = {
  slug: "image-to-obj",
  engine: "image",
  defaultFormat: "obj",
  category: "convert",
  shortName: "Image to OBJ",
  cardText: "Heightmap or traced image as an OBJ mesh for Blender, games and CAD.",
  title: "Image to OBJ Converter — Heightmap & Logo Meshes from Images",
  metaDescription:
    "Convert PNG or JPG images to OBJ meshes: heightmap terrain and reliefs, or traced and extruded logos. Closed geometry in millimetres. Free and runs in your browser.",
  h1: "Image to OBJ Converter",
  valueLine: "Generate OBJ meshes from images — terrain and relief heightmaps or extruded logos.",
  intro: [
    "Heightmaps are a staple in 3D work beyond printing: terrain for games, displacement for product renders, embossed details in architectural models. This converter turns any image into an OBJ mesh you can import into Blender, Unity, Unreal or a CAD tool.",
    "In Heightmap mode each pixel becomes a vertex whose height follows its brightness, with a solid base and walls so the mesh is closed. You choose the mesh density with the Detail and resolution settings, which is important when you need a low-poly terrain rather than a million-triangle print. In Extrude mode the image is traced into outlines and extruded, giving a clean logo mesh with far fewer triangles than a heightmap.",
    "OBJ is selected by default; switch to STL or 3MF from the format menu at any time. All geometry is created locally in your browser.",
  ],
  howTo: [
    { name: "Open an image", text: "Drop a heightmap, photo or logo image onto the tool." },
    { name: "Choose mode and density", text: "Pick Heightmap or Extrude. For heightmaps, set Detail and resolution to control the polygon count." },
    { name: "Set scale", text: "Enter the width and height range in millimetres." },
    { name: "Download OBJ", text: "Click Download OBJ and import it into your 3D application." },
  ],
  settings: [heightmapSettings[0], heightmapSettings[2], heightmapSettings[7], heightmapSettings[3], heightmapSettings[5], heightmapSettings[6], extrudeSettings[3]],
  useCases: [
    { title: "Game terrain", text: "Turn a greyscale heightmap into a terrain mesh at Low detail for real-time use." },
    { title: "Displacement previews", text: "Check how a texture reads as geometry before setting up displacement in a renderer." },
    { title: "Logo meshes", text: "Extrude a logo image into an OBJ for a 3D title sequence." },
  ],
  printTips: [
    "Triangle count rises with the square of resolution — halve the resolution for a quarter of the triangles.",
    "OBJ has no units; this tool writes millimetres. Set the import scale in your 3D app if needed.",
    "The base and walls make the mesh closed; delete them in your editor if you only want the surface.",
  ],
  faq: [
    { q: "How do I convert an image to OBJ?", a: "Drop the image here, choose Heightmap or Extrude, set the size, and click Download OBJ." },
    { q: "How can I reduce the polygon count?", a: "Lower the image resolution and set Detail to Low, or use Extrude mode, which produces far fewer triangles." },
    { q: "What units does the OBJ use?", a: "Millimetres. OBJ doesn't store units, so set the scale on import if your app assumes metres." },
    { q: "Is the mesh closed or just a surface?", a: "Closed: it includes a flat bottom and side walls, so it's ready for printing or boolean operations." },
    ...imageFaqCore,
    { q: "Does the OBJ include textures or UVs?", a: "No. Only geometry is exported." },
  ],
  related: ["image-to-stl", "image-to-3mf", "svg-to-obj", "obj-viewer", "lithophane-maker"],
  convertFrom: ["image-to-stl"],
  convertTo: ["image-to-stl", "image-to-3mf"],
  updated: "2026-10-12",
};

export const imageTo3mf: ToolPage = {
  slug: "image-to-3mf",
  engine: "image",
  preset: { mode: "extrude", logoBase: "rect" },
  defaultFormat: "3mf",
  category: "convert",
  shortName: "Image to 3MF",
  cardText: "Logo and base as separate 3MF objects, ready for two-colour printing.",
  title: "Image to 3MF Converter — Two-Colour Ready 3D Models from Images",
  metaDescription:
    "Convert PNG or JPG images to 3MF. Logo and base are separate objects for two-colour and AMS printing; heightmap reliefs too. Real mm units. Free, private, in-browser.",
  h1: "Image to 3MF Converter",
  valueLine: "Get a 3MF with the logo and base as separate parts — ready to assign two filaments.",
  intro: [
    "3MF is the native format of modern slicers such as Bambu Studio, PrusaSlicer and OrcaSlicer. It stores real units and can hold several objects in one file, which makes it the best choice when a print has more than one colour.",
    "This converter opens in Extrude mode with a rectangle base, so a traced logo and its base plate are saved as two separate, aligned objects. In your slicer you simply assign a filament to each one. Brightness levels and the keyring tab are included in the same file, and the units are already millimetres, so nothing needs rescaling.",
    "Prefer a relief? Switch to Heightmap mode and the relief is saved as a single 3MF object. Images are processed locally on your device, so you can convert client logos without sending them anywhere.",
  ],
  howTo: [
    { name: "Open the image", text: "Drop a PNG, JPG or WebP logo onto the tool." },
    { name: "Check the trace and base", text: "Adjust the threshold or background removal until the preview looks right. The rectangle base is on by default." },
    { name: "Set sizes", text: "Choose the width, logo height and base thickness." },
    { name: "Download 3MF", text: "Click Download 3MF, open it in your slicer and assign a filament to each object." },
  ],
  settings: [...extrudeSettings.slice(0, 5), extrudeSettings[5], { name: "3MF objects", text: "Logo, base and loop are written as separate named objects with display colours, positioned exactly as in the preview." }],
  useCases: [
    { title: "Two-colour signs on an AMS", text: "Base in white, logo in black — assign each object to a slot and print in one go." },
    { title: "Single-nozzle colour change", text: "Use the separate objects to check the exact layer where the logo starts for a manual filament swap." },
    { title: "Batch badges", text: "Duplicate the 3MF assembly on the plate in your slicer to print a run of badges." },
  ],
  printTips: [
    "Keep the base and logo grouped as one assembly in your slicer so they stay aligned.",
    "A 1.5–2 mm base with a 2–3 mm logo reads clearly from a distance.",
    "Choose contrasting filaments: logo details are easier to see than with similar colours.",
  ],
  faq: [
    { q: "How do I convert an image to 3MF?", a: "Drop the image here, adjust the trace and base, and click Download 3MF." },
    { q: "Why use 3MF instead of STL?", a: "3MF keeps the logo and base as separate objects with real units, which makes multi-colour printing easy. STL merges everything into one body." },
    { q: "Will Bambu Studio and PrusaSlicer open it?", a: "Yes. Both, along with OrcaSlicer and Cura, open standard 3MF files." },
    { q: "Can I export a heightmap as 3MF?", a: "Yes. Switch to Heightmap mode; the relief is saved as one object." },
    ...imageFaqCore,
    { q: "Are the colours in the 3MF used for printing?", a: "They're display colours to help you tell the parts apart. You still choose the actual filament for each object in your slicer." },
  ],
  related: ["image-to-stl", "svg-to-3mf", "image-to-obj", "3mf-viewer", "logo-to-stl"],
  convertFrom: ["image-to-stl"],
  convertTo: ["image-to-stl", "image-to-obj"],
  updated: "2026-10-12",
};

export const imagePages: ToolPage[] = [imageToStl, pngToStl, jpgToStl, webpToStl, logoToStl, imageToObj, imageTo3mf];
