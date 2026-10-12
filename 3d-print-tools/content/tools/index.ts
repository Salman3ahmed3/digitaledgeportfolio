import type { ToolPage } from "../types";
import { stlViewer } from "./stl-viewer";
import { viewerPresets } from "./viewers";
import { svgPages } from "./svg-tools";
import { imagePages } from "./image-tools";

// Each tool page lives in its own file; add new presets here.
export const TOOLS: ToolPage[] = [...imagePages, ...svgPages, stlViewer, ...viewerPresets];

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const toolsByCategory = (c: ToolPage["category"]) => TOOLS.filter((t) => t.category === c);
