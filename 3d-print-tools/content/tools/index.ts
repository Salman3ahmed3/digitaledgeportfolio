import type { ToolPage } from "../types";
import { stlViewer } from "./stl-viewer";

// Each tool page lives in its own file; add new presets here.
export const TOOLS: ToolPage[] = [stlViewer];

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const toolsByCategory = (c: ToolPage["category"]) => TOOLS.filter((t) => t.category === c);
