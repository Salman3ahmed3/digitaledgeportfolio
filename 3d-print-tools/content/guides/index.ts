import type { Guide } from "../types";
import { lithophanePrintSettings } from "./lithophane-print-settings";

export const GUIDES: Guide[] = [lithophanePrintSettings];
export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
