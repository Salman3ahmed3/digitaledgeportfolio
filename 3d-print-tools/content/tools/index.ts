import type { ToolPage } from "../types";
import { stlViewer } from "./stl-viewer";
import { viewerPresets } from "./viewers";
import { svgPages } from "./svg-tools";
import { imagePages } from "./image-tools";
import { lithophaneMaker } from "./lithophane-maker";

// Each tool page lives in its own file; add new presets here.
export const TOOLS: ToolPage[] = [lithophaneMaker, ...imagePages, ...svgPages, stlViewer, ...viewerPresets];

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const toolsByCategory = (c: ToolPage["category"]) => TOOLS.filter((t) => t.category === c);
