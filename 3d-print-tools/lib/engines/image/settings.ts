import type { DepthCurve } from "./pixels";
import type { LoopPosition } from "../shapes";

export type ImageMode = "heightmap" | "extrude";

export interface ImageSettings {
  mode: ImageMode;
  maxEdge: number;
  width: number;
  // heightmap
  maxHeight: number;
  minHeight: number;
  baseThickness: number;
  invert: boolean;
  curve: DepthCurve;
  gamma: number;
  smoothing: number;
  mirror: boolean;
  detail: "low" | "medium" | "high";
  // extrude (logo)
  threshold: number; // -1 = auto (Otsu)
  invertMask: boolean;
  removeBackground: boolean;
  bgColor: string; // "" = auto from corners
  bgTolerance: number;
  minSpeck: number; // px²
  outlineSmooth: number; // Chaikin iterations 0–3
  outlineSimplify: number; // px
  extrudeHeight: number;
  heightMode: "same" | "brightness";
  levels: number;
  logoBase: "none" | "rect" | "outline";
  logoBaseThickness: number;
  logoBaseMargin: number;
  keyring: boolean;
  keyringPosition: LoopPosition;
  holeDiameter: number;
}

export const IMAGE_DEFAULTS: ImageSettings = {
  mode: "heightmap",
  maxEdge: 800,
  width: 100,
  maxHeight: 5,
  minHeight: 0,
  baseThickness: 1,
  invert: false,
  curve: "linear",
  gamma: 1,
  smoothing: 0,
  mirror: false,
  detail: "medium",
  threshold: -1,
  invertMask: false,
  removeBackground: false,
  bgColor: "",
  bgTolerance: 15,
  minSpeck: 20,
  outlineSmooth: 1,
  outlineSimplify: 0.5,
  extrudeHeight: 3,
  heightMode: "same",
  levels: 3,
  logoBase: "none",
  logoBaseThickness: 1.5,
  logoBaseMargin: 3,
  keyring: false,
  keyringPosition: "top",
  holeDiameter: 4,
};

export const DETAIL_STRIDE = { low: 4, medium: 2, high: 1 } as const;
