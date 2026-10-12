import type { ToolPage } from "../types";

export const stlViewer: ToolPage = {
  slug: "stl-viewer",
  engine: "viewer",
  category: "view",
  shortName: "STL Viewer",
  cardText: "Open STL, OBJ, 3MF, PLY and GLB files. Measure, check watertightness, convert.",
  title: "Free Online STL Viewer — View, Measure & Convert 3D Files",
  metaDescription:
    "View STL, OBJ, 3MF, PLY and GLB files in your browser. Check size, volume and watertightness, measure, screenshot and convert formats. No upload.",
  h1: "Online STL Viewer",
  valueLine: "Open a 3D file to inspect it, measure it and check it's printable — the file stays on your computer.",
  intro: [
    "This viewer opens STL files (both ASCII and binary) and the other formats you are likely to meet when 3D printing: OBJ with its MTL material file, 3MF, PLY and GLB/glTF. Drop one or more files onto the page and they appear in an interactive 3D view you can rotate, pan and zoom.",
    "Beyond looking at a model, the info panel answers the questions that matter before you print. How big is it in millimetres or inches? What is its volume, so you can estimate filament? How many triangles does it have? Is it watertight, or does it have holes that will confuse your slicer? A point-to-point measuring tool lets you check a hole diameter or wall distance directly.",
    "Everything happens in your browser. Large files are parsed in a background worker so the page stays responsive, and nothing is uploaded. When you are done you can save a PNG screenshot or convert the model to STL, OBJ, GLB, 3MF or PLY.",
  ],
  howTo: [
    { name: "Open your file", text: "Drag one or more files onto the drop zone, click it to browse, or paste a file. STL, OBJ (+MTL), 3MF, PLY, GLB and glTF are supported." },
    { name: "Look around", text: "Drag to rotate, right-drag or two-finger drag to pan, and scroll or pinch to zoom. Use the view buttons for front, top, side and isometric views." },
    { name: "Check the numbers", text: "Read the size, volume, surface area, triangle count and watertight check in the info panel. Switch between mm and inches if needed." },
    { name: "Measure", text: "Turn on Measure and click two points on the model to see the straight-line distance between them." },
    { name: "Save or convert", text: "Take a PNG screenshot, or choose a format under Convert and download the model." },
  ],
  settings: [
    { name: "View presets", text: "Jump to Front, Back, Left, Right, Top, Bottom or Isometric views. Reset view refits the camera to the whole scene." },
    { name: "Shading", text: "Solid uses smooth lighting, Flat shows each triangle facet, and Wireframe shows the mesh edges — handy for spotting very dense or very coarse areas." },
    { name: "Model and background colour", text: "Change the colours to match your filament or to make a screenshot easier to read." },
    { name: "Grid and axes", text: "Show a millimetre grid on the build plane and the X (red), Y (green) and Z (blue) axes." },
    { name: "Units", text: "Show dimensions in millimetres or inches. STL files have no units; like slicers, the viewer assumes millimetres." },
    { name: "Watertight check", text: "Reports whether every edge is shared by exactly two triangles. A model that fails may have holes or overlapping parts that can cause slicing errors." },
  ],
  useCases: [
    { title: "Check a download before printing", text: "Open an STL from a model library to confirm its real size and that it is a closed solid before you spend hours printing it." },
    { title: "Estimate filament", text: "Use the volume reading to estimate how much material a solid part will use, then compare quotes or spool stock." },
    { title: "Share a quick render", text: "Set a colour and view angle and save a PNG screenshot for a listing, a forum post or a client update." },
  ],
  printTips: [
    "If the size looks 25.4 times too small or large, the file was probably exported in inches or metres. Scale it in your slicer.",
    "A model that fails the watertight check can often still print — slicers repair small gaps — but large holes usually mean missing walls.",
    "Volume reflects a 100% solid part. With infill and walls, a real print uses less material.",
    "Very high triangle counts (millions) don't improve print quality beyond your printer's resolution and slow slicers down.",
  ],
  faq: [
    { q: "Is this STL viewer free?", a: "Yes, it's free and unlimited with no sign-up. There is no file size cap other than what your device's memory can handle." },
    { q: "Are my files uploaded anywhere?", a: "No. Files are read and displayed by your browser. Nothing is sent to our server or anyone else." },
    { q: "Can it open ASCII and binary STL?", a: "Yes. The viewer detects the STL type automatically." },
    { q: "What does \"watertight\" mean?", a: "A watertight (manifold) mesh has no holes: every triangle edge is shared by exactly two triangles. Slicers need that to know what is inside and outside of the model." },
    { q: "Why does my model look tiny or huge?", a: "STL has no unit information. Most files use millimetres, but some CAD programs export in inches or metres. The viewer assumes millimetres, like most slicers." },
    { q: "Can I open OBJ files with textures?", a: "Drop the OBJ together with its MTL file to apply material colours. Texture images are not loaded in this version." },
    { q: "Can I convert STL to OBJ or 3MF here?", a: "Yes. Open the file and pick a format under Convert. Colours and textures are not carried over to STL or PLY." },
  ],
  related: ["obj-viewer", "3mf-viewer", "image-to-stl", "svg-to-stl", "lithophane-maker", "glb-viewer"],
  convertFrom: ["obj-viewer", "3mf-viewer", "ply-viewer", "glb-viewer"],
  updated: "2026-10-12",
};
