import type { CurveDetail } from "./parse";
import type { LoopPosition, LoopStyle, PlateShape } from "../shapes";
import type { FontKey } from "../text";

export type SvgMode = "extrude" | "stencil" | "keychain" | "cookie";

export interface SvgSettings {
  mode: SvgMode;
  source: "file" | "text";
  text: string;
  font: FontKey;
  letterSpacing: number;
  /** Real width of the artwork in mm. */
  width: number;
  height: number;
  bevel: number;
  curve: CurveDetail;
  baseThickness: number;
  baseMargin: number;
  removeBackground: boolean;
  bgTolerance: number;
  closeShapes: boolean;
  includeStrokes: boolean;
  /** 0 = use stroke widths from the SVG; otherwise mm. */
  lineWidth: number;
  // stencil
  stencilCut: "through" | "recess";
  recessDepth: number;
  plateThickness: number;
  plateMargin: number;
  // keychain
  plateShape: PlateShape;
  artStyle: "raised" | "flush" | "engraved";
  artDepth: number;
  loop: LoopStyle;
  loopPosition: LoopPosition;
  holeDiameter: number;
  // cookie cutter
  wallThickness: number;
  cutterHeight: number;
  flangeWidth: number;
  flangeThickness: number;
}

export const SVG_DEFAULTS: SvgSettings = {
  mode: "extrude",
  source: "file",
  text: "Hello",
  font: "inter",
  letterSpacing: 0,
  width: 80,
  height: 3,
  bevel: 0,
  curve: "medium",
  baseThickness: 0,
  baseMargin: 3,
  removeBackground: true,
  bgTolerance: 10,
  closeShapes: true,
  includeStrokes: true,
  lineWidth: 0,
  stencilCut: "through",
  recessDepth: 1,
  plateThickness: 2,
  plateMargin: 6,
  plateShape: "rounded",
  artStyle: "raised",
  artDepth: 1.2,
  loop: "tab",
  loopPosition: "top",
  holeDiameter: 4,
  wallThickness: 1,
  cutterHeight: 12,
  flangeWidth: 4,
  flangeThickness: 1.5,
};

export interface LayerOverride {
  visible: boolean;
  /** null = use the global height */
  height: number | null;
  z: number;
}
