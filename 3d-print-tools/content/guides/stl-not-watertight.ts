import type { Guide } from "../types";

export const stlNotWatertight: Guide = {
  slug: "why-is-my-stl-hollow-or-not-watertight",
  title: "Why Is My STL Hollow or Not Watertight? Causes and Fixes",
  metaDescription:
    "What “watertight” and “manifold” mean, why an STL looks hollow or fails to slice, and how to fix holes, flipped normals, zero-thickness walls and overlapping parts.",
  h1: "Why is my STL hollow or not watertight?",
  summary:
    "Slicers need a closed surface to decide what's inside a model. When a mesh has holes, flipped faces or paper-thin walls, you get hollow layers, missing sections or slicer warnings. Here's what's going on and how to fix it.",
  updated: "2026-10-12",
  sections: [
    {
      heading: "What “watertight” means",
      body: [
        "An STL is just a list of triangles. A watertight (or manifold) mesh is one where those triangles form a closed skin: every edge is shared by exactly two triangles and every triangle faces outward. If you could fill it with water, none would leak out.",
        "The STL viewer on this site checks this for you and reports how many open edges (holes) and non-manifold edges (more than two triangles meeting, or inconsistent directions) a model has.",
      ],
    },
    {
      heading: "Common causes",
      list: [
        "Missing faces: a model exported from a game or web scene with open bottoms or back faces removed.",
        "Single-surface objects: planes such as leaves, flags or clothing with zero thickness.",
        "Flipped normals: some triangles face inward, so the slicer thinks that region is outside.",
        "Overlapping parts: separate bodies pushed into each other instead of merged.",
        "Units mix-ups: a model exported in metres can look like a speck and be mistaken for an empty file.",
      ],
      body: [],
    },
    {
      heading: "How to fix it",
      body: [
        "Start with the simplest tool that works. Most slicers (PrusaSlicer, Bambu Studio, OrcaSlicer, Cura) repair small holes and flipped normals automatically when you import. For larger problems, use a mesh tool.",
      ],
      table: [
        ["Problem", "Quick fix"],
        ["Small holes, flipped normals", "Let your slicer repair on import, or use its “Fix model” option."],
        ["Large holes", "Blender: select the boundary edges and Fill (F), or Meshmixer's Inspector."],
        ["Zero-thickness surfaces", "Add thickness: Blender's Solidify modifier, or rebuild as a solid."],
        ["Overlapping bodies", "Usually fine in slicers; for a single clean mesh use a boolean union."],
        ["Wrong size", "Scale by 1000 (metres) or 25.4 (inches) in your slicer."],
      ],
    },
    {
      heading: "Models made with this site",
      body: [
        "The image, SVG and lithophane tools build solids with manifold boolean operations and check every result before download. If one of those files shows a problem in your slicer, it's usually not a hole but a detail that's thinner than your nozzle — increase the size, base or line width.",
      ],
    },
  ],
  faq: [
    { q: "Why does my STL look hollow in the slicer?", a: "Either the walls really are thin (a shell with no inside) or the mesh isn't closed, so the slicer can't tell inside from outside. Check it in the STL viewer's watertight test." },
    { q: "Will a non-watertight STL still print?", a: "Often yes, if the problem is small and your slicer repairs it. Large holes or zero-thickness walls usually print with missing sections." },
    { q: "What is a non-manifold edge?", a: "An edge shared by more than two triangles, or by two triangles facing opposite ways. It makes the inside/outside ambiguous." },
  ],
  relatedTools: ["stl-viewer", "obj-viewer", "glb-viewer", "svg-to-stl"],
};
