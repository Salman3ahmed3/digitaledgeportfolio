import type { ToolPage } from "../types";

const viewerRelated = ["stl-viewer", "obj-viewer", "3mf-viewer", "ply-viewer", "glb-viewer"];
const others = (slug: string) => viewerRelated.filter((s) => s !== slug);

export const objViewer: ToolPage = {
  slug: "obj-viewer",
  engine: "viewer",
  preset: { focus: "obj" },
  defaultFormat: "stl",
  category: "view",
  shortName: "OBJ Viewer",
  cardText: "View OBJ files with MTL colours and convert OBJ to STL or 3MF.",
  title: "OBJ Viewer Online — Open OBJ + MTL Files, Convert OBJ to STL",
  metaDescription:
    "Open Wavefront OBJ files with their MTL colours in your browser. Check size and watertightness, measure, and convert OBJ to STL, 3MF or GLB. Free, no upload.",
  h1: "OBJ Viewer and OBJ to STL Converter",
  valueLine: "Drop an .obj (and its .mtl) to inspect it, then save it as STL or 3MF for your slicer.",
  intro: [
    "OBJ is the format Blender, ZBrush, Maya and most 3D scanning apps reach for when they export a mesh. It stores geometry as plain text and keeps colours and materials in a separate MTL file. That makes it easy to share, but not every slicer or marketplace accepts it, and an OBJ that looks fine in an art package isn't always a printable solid.",
    "This viewer opens OBJ files directly in your browser. Drop the .obj together with its .mtl to see material colours, and the tool splits multi-material objects into separate parts. The info panel shows real dimensions, volume, triangle count and whether the mesh is watertight, which tells you quickly if a sculpt has open seams or loose pieces.",
    "When it looks right, convert it: STL for any slicer, 3MF to keep separate parts and colour hints, or GLB for the web. Polygons with four or more sides are triangulated automatically. Nothing is uploaded at any point.",
  ],
  howTo: [
    { name: "Select the OBJ and MTL together", text: "Drag both files onto the drop zone at once, or select both in the file picker. The MTL is optional." },
    { name: "Check scale", text: "OBJ has no fixed unit. If the size readout looks 10× or 1000× off, the source app exported in centimetres or metres." },
    { name: "Inspect the mesh", text: "Use Flat or Wireframe shading to see polygon density, and check the watertight result before printing." },
    { name: "Convert", text: "Choose STL, 3MF, GLB or PLY under Convert and download." },
  ],
  settings: [
    { name: "MTL colours", text: "Diffuse colours (Kd) from the MTL file are applied per material. Texture images (map_Kd) are not loaded." },
    { name: "Shading", text: "Solid, Flat or Wireframe. Wireframe is useful for spotting sculpts with millions of tiny triangles." },
    { name: "Measure", text: "Click two points to get the straight-line distance, shown in mm or inches." },
    { name: "Convert to", text: "STL merges everything into one file; 3MF and GLB keep separate parts and material colours." },
  ],
  useCases: [
    { title: "Blender exports", text: "Check that a model exported from Blender has the size you expect before slicing, and convert it to STL in one step." },
    { title: "Photogrammetry and scans", text: "Many scanning apps export OBJ. Open the scan, measure it and check for holes that need repairing." },
    { title: "Marketplace uploads", text: "Some print marketplaces only accept STL or 3MF. Convert an OBJ without installing anything." },
  ],
  printTips: [
    "If parts of the model look inside-out (dark patches), the source app exported flipped normals. Recalculate normals before exporting.",
    "Sculpts often have far more triangles than a printer can reproduce. Decimate in your modelling app to keep slicing fast.",
    "Separate objects in an OBJ will be separate bodies in your slicer — make sure they touch or overlap if they should print as one piece.",
  ],
  faq: [
    { q: "How do I convert OBJ to STL?", a: "Drop the OBJ file onto this page, choose STL under Convert and click Download. The conversion runs in your browser." },
    { q: "Why are my OBJ colours missing?", a: "Colours live in the MTL file. Select the .obj and .mtl together. Image textures are not supported in this version." },
    { q: "Does STL keep the OBJ colours?", a: "No. STL only stores geometry. Use 3MF if you want to keep separate parts with colour hints for multi-colour printing." },
    { q: "My model is tiny or huge — why?", a: "OBJ files don't record units. The viewer assumes millimetres; scale the model in your slicer if it was exported in centimetres, metres or inches." },
    { q: "Can I open OBJ files with quads or n-gons?", a: "Yes. Faces with more than three sides are split into triangles when the file is loaded." },
    { q: "Is my file uploaded?", a: "No. The OBJ is parsed on your device in a background worker and never sent anywhere." },
  ],
  related: [...others("obj-viewer"), "image-to-obj", "svg-to-obj"],
  convertTo: ["stl-viewer", "3mf-viewer", "glb-viewer"],
  updated: "2026-10-12",
};

export const threeMfViewer: ToolPage = {
  slug: "3mf-viewer",
  engine: "viewer",
  preset: { focus: "3mf" },
  defaultFormat: "stl",
  category: "view",
  shortName: "3MF Viewer",
  cardText: "Open 3MF files from PrusaSlicer, Bambu Studio and Cura. Convert 3MF to STL.",
  title: "3MF Viewer Online — Open and Convert 3MF to STL Free",
  metaDescription:
    "View 3MF files in your browser, including multi-object files from Bambu Studio, PrusaSlicer and Cura. Check size and volume, then convert 3MF to STL, OBJ or GLB.",
  h1: "3MF Viewer and 3MF to STL Converter",
  valueLine: "Look inside a 3MF without opening a slicer, and export its models as STL, OBJ or GLB.",
  intro: [
    "3MF is the modern replacement for STL. It is a zip package that stores real units, several objects, colours and, in slicer project files, print settings too. Most model sites and slicers now use it, but if you only want to check a model — or need an STL for older software — opening a full slicer is overkill.",
    "This viewer reads the mesh data inside a 3MF file right in your browser. Every object in the build is shown in place, so you can see how a multi-part model fits together, measure it and check its total volume. The watertight check helps you spot objects that will cause slicing errors.",
    "Need a different format? Convert the 3MF to STL for older slicers and CNC tools, to OBJ for modelling apps, or to GLB for web viewers. Slicer-specific settings inside project files are ignored; only the geometry is read. Your file stays on your device.",
  ],
  howTo: [
    { name: "Open the 3MF", text: "Drop a .3mf file on the drop zone or click to choose one. Project files from Bambu Studio, PrusaSlicer, OrcaSlicer and Cura work." },
    { name: "Inspect the objects", text: "Rotate the view, switch shading and check each object's position. Use Measure for specific distances." },
    { name: "Read the numbers", text: "Check size, triangle count, volume and the watertight result in the info panel." },
    { name: "Convert", text: "Choose STL, OBJ, GLB or PLY under Convert and download." },
  ],
  settings: [
    { name: "Objects", text: "All mesh objects in the 3MF are loaded with their build transforms applied, so they appear as arranged in the file." },
    { name: "Units", text: "Measurements assume the 3MF uses millimetres, the default for 3D printing files." },
    { name: "Convert to STL", text: "All objects are written into a single STL. Use OBJ or GLB to keep them as separate named parts." },
    { name: "Display options", text: "Shading, model colour, background, grid and axes only affect the preview, not the exported file." },
  ],
  useCases: [
    { title: "Quick look at a download", text: "Check what's inside a 3MF from a model site before importing it into your slicer and overwriting your current plate." },
    { title: "Older software", text: "Some CAM, CNC and older slicing tools only read STL. Convert the 3MF without installing anything." },
    { title: "Multi-part kits", text: "See how a multi-object print is laid out and measure the parts before you print them." },
  ],
  printTips: [
    "3MF project files can contain slicer settings tuned for someone else's printer. Re-check temperatures and speeds after importing.",
    "If objects overlap in the viewer, they will also overlap in your slicer — that's usually intentional for multi-colour parts.",
    "Converting to STL loses colours and object names. Keep the original 3MF for multi-material printing.",
  ],
  faq: [
    { q: "How do I convert 3MF to STL?", a: "Open the 3MF here, select STL under Convert and click Download. All objects are written into one STL file." },
    { q: "Can it open Bambu Studio or PrusaSlicer project files?", a: "Yes, it reads the meshes from project files. Print settings, painted supports and plate layouts are ignored." },
    { q: "Why does my 3MF show nothing?", a: "Some 3MF files only reference external or compressed component data this viewer can't read. Re-export the model as a plain 3MF from your slicer." },
    { q: "Does the viewer keep colours from 3MF?", a: "The preview uses a single colour. Conversion keeps object separation in OBJ, GLB and 3MF output." },
    { q: "Is 3MF better than STL?", a: "For most printing workflows, yes: it stores units, multiple objects and colours, and files are smaller. STL is still the most widely supported." },
    { q: "Is my file uploaded?", a: "No. The 3MF is unzipped and read by your browser; nothing is sent to a server." },
  ],
  related: [...others("3mf-viewer"), "svg-to-3mf", "image-to-3mf"],
  convertTo: ["stl-viewer", "obj-viewer", "glb-viewer"],
  updated: "2026-10-12",
};

export const plyViewer: ToolPage = {
  slug: "ply-viewer",
  engine: "viewer",
  preset: { focus: "ply" },
  defaultFormat: "stl",
  category: "view",
  shortName: "PLY Viewer",
  cardText: "Open PLY meshes from 3D scanners and convert PLY to STL for printing.",
  title: "PLY Viewer Online — View 3D Scans and Convert PLY to STL",
  metaDescription:
    "Open ASCII or binary PLY meshes from 3D scanners and photogrammetry in your browser. Measure, check for holes and convert PLY to STL or 3MF for printing.",
  h1: "PLY Viewer and PLY to STL Converter",
  valueLine: "Open a scanned mesh, see if it's printable, and convert it to STL — without uploading it.",
  intro: [
    "PLY (Polygon File Format) is common output from 3D scanners, phone scanning apps and photogrammetry software such as Meshroom. It can hold either a triangle mesh or just a point cloud, in ASCII or binary form, and slicers usually can't open it directly.",
    "This viewer loads PLY meshes in your browser and shows them in 3D with real measurements. Scans are often the messiest models you will print, so the info panel matters: the watertight check reports how many open edges the scan has, which tells you whether it needs hole-filling before it will slice cleanly.",
    "Convert the scan to STL for any slicer, or to 3MF or OBJ for further editing. Large scans with millions of triangles are parsed in a background worker so the page stays responsive. The file never leaves your device. Point-cloud-only PLY files (no faces) can't be shown as a surface; mesh them first in your scanning software.",
  ],
  howTo: [
    { name: "Open the PLY", text: "Drop a .ply file on the drop zone or click to browse. ASCII and binary PLY are both supported." },
    { name: "Check the scale", text: "Scanning apps use different units. If the size readout looks wrong, note the factor and scale in your slicer." },
    { name: "Check for holes", text: "Read the watertight result and the open-edge count. Scans usually need repair if there are many." },
    { name: "Convert to STL", text: "Choose STL (or 3MF, OBJ, GLB) under Convert and download." },
  ],
  settings: [
    { name: "Mesh vs point cloud", text: "Only PLY files that contain faces display as a surface. Pure point clouds need meshing first." },
    { name: "Watertight check", text: "Counts edges with only one adjacent triangle (holes) and edges shared by more than two (non-manifold)." },
    { name: "Shading", text: "Flat shading makes scan noise easier to see; Wireframe shows mesh density." },
    { name: "Convert", text: "Vertex colours from the scan are not carried over to STL. GLB and 3MF exports use a single material colour." },
  ],
  useCases: [
    { title: "Phone and handheld scans", text: "Check a scan from a phone app or handheld scanner before spending time on repair or printing." },
    { title: "Photogrammetry output", text: "Open a mesh from Meshroom or similar tools, measure it against the real object, and convert it to STL." },
    { title: "Reverse engineering", text: "Measure key dimensions on a scanned part to model a replacement in CAD." },
  ],
  printTips: [
    "Scans almost always have a hole where the object sat on the turntable or table. Close it in your scanning or repair software before printing.",
    "Decimate dense scans to a few hundred thousand triangles — more detail than that won't show at typical nozzle sizes.",
    "If the scan has a ragged base, cut it flat in your slicer so it sits on the bed.",
  ],
  faq: [
    { q: "How do I convert PLY to STL?", a: "Open the PLY file here, choose STL under Convert and click Download. The conversion runs entirely in your browser." },
    { q: "Why is my PLY file blank?", a: "It is probably a point cloud with no faces. Turn the points into a mesh in your scanning software (often called meshing or surface reconstruction) and export again." },
    { q: "Does it support binary PLY?", a: "Yes, both ASCII and binary little/big-endian PLY files are supported." },
    { q: "Will the scan colours be kept?", a: "Not in this version. Vertex colours are ignored in the preview and export." },
    { q: "My scan isn't watertight. Can I still print it?", a: "Sometimes. Slicers can close small gaps, but large holes usually need repair in a mesh tool first." },
    { q: "Is there a size limit?", a: "No fixed limit. Very large scans depend on your device's memory; a desktop browser handles them best." },
  ],
  related: [...others("ply-viewer"), "image-to-stl"],
  convertTo: ["stl-viewer", "obj-viewer", "3mf-viewer"],
  updated: "2026-10-12",
};

export const glbViewer: ToolPage = {
  slug: "glb-viewer",
  engine: "viewer",
  preset: { focus: "glb" },
  defaultFormat: "stl",
  category: "view",
  shortName: "GLB / glTF Viewer",
  cardText: "Open GLB and glTF models and convert GLB to STL for 3D printing.",
  title: "GLB Viewer Online — Open glTF Models and Convert GLB to STL",
  metaDescription:
    "View GLB and glTF files in your browser and convert them to STL, 3MF or OBJ for 3D printing. Units and axes are converted for slicers automatically. No upload.",
  h1: "GLB and glTF Viewer with GLB to STL Conversion",
  valueLine: "Open a web or AR model and turn it into a printable STL with the right size and orientation.",
  intro: [
    "GLB (binary glTF) is the standard format for 3D on the web, in AR apps and in game engines. Many model libraries offer it as the default download. It is not a 3D printing format, though: glTF measures in metres with the Y axis pointing up, while slicers expect millimetres with Z up.",
    "This viewer opens .glb files, and .gltf files that embed their data, and converts them as they load: metres become millimetres and the model is rotated so it stands upright on the build plate. The info panel then shows real dimensions, triangle count, volume and a watertight check.",
    "That last check matters because web models are built to look good, not to be solid. They often have open edges, single-sided planes or separate floating parts. Use the check to see if a model is printable as-is, then convert it to STL, 3MF or OBJ. Everything runs in your browser.",
  ],
  howTo: [
    { name: "Open the model", text: "Drop a .glb file, or a .gltf with embedded buffers, onto the drop zone." },
    { name: "Check size and orientation", text: "The model is converted to millimetres and Z-up automatically. Confirm the size in the info panel." },
    { name: "Check printability", text: "Look at the watertight result. Web models often need thickening or repair before printing." },
    { name: "Convert to STL", text: "Choose STL, 3MF or OBJ under Convert and download." },
  ],
  settings: [
    { name: "Unit conversion", text: "glTF uses metres; the viewer multiplies by 1000 so a 0.1 m model shows as 100 mm." },
    { name: "Axis conversion", text: "glTF is Y-up; models are rotated to Z-up so they stand on the build plate in your slicer." },
    { name: "Materials", text: "Base colours are shown in the preview. Textures, animations and skinning are ignored for printing." },
    { name: "External .gltf files", text: ".gltf files that reference separate .bin or texture files can't be loaded; use the .glb version instead." },
  ],
  useCases: [
    { title: "Print a model from a web library", text: "Many free model libraries offer GLB downloads. Convert one to STL and check it is a solid before printing." },
    { title: "AR and game assets", text: "Turn a character or prop from a game or AR project into a figure, after checking it is watertight." },
    { title: "Measure a product model", text: "Check real-world dimensions of a GLB product model used on a website." },
  ],
  printTips: [
    "Thin planes like leaves, hair cards or clothing are often single-sided in game models and won't print. Thicken them in a modelling app.",
    "Characters are often built from many separate overlapping pieces. Most slicers handle overlaps, but check for floating parts.",
    "Scale small figures up in your slicer if fine details are thinner than about 0.8 mm.",
  ],
  faq: [
    { q: "How do I convert GLB to STL?", a: "Open the GLB here, choose STL under Convert and click Download. Units and orientation are converted for 3D printing automatically." },
    { q: "Why is my GLB model not watertight?", a: "Web and game models are made to look right on screen, so they often have open edges and one-sided faces. Repair or thicken them before printing." },
    { q: "Can I open .gltf files?", a: "Yes, if the data is embedded in the .gltf file. Files that point to separate .bin or image files aren't supported; use a .glb instead." },
    { q: "Are animations or textures kept?", a: "No. Only the mesh geometry in its default pose is used. STL can't store colour or animation." },
    { q: "Why is the model the wrong size?", a: "glTF should be in metres, but some exporters ignore that. If the model is 1000× too big or small, scale it in your slicer." },
    { q: "Is my model uploaded?", a: "No. The file is parsed by your browser and stays on your device." },
  ],
  related: [...others("glb-viewer"), "image-to-stl"],
  convertTo: ["stl-viewer", "obj-viewer", "3mf-viewer"],
  updated: "2026-10-12",
};

export const viewerPresets: ToolPage[] = [objViewer, threeMfViewer, plyViewer, glbViewer];
