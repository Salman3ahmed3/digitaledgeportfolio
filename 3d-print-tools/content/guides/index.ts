import type { Guide } from "../types";
import { lithophanePrintSettings } from "./lithophane-print-settings";
import { prepareSvg } from "./prepare-svg";
import { stlNotWatertight } from "./stl-not-watertight";

export const GUIDES: Guide[] = [lithophanePrintSettings, prepareSvg, stlNotWatertight];
export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
