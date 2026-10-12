import type { FontKey } from "../text";

export type LithoShape = "flat" | "arc" | "cylinder" | "heart" | "circle";
export type Aspect = "original" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export interface LithoSettings {
  shape: LithoShape;
  /** Flat/arc/heart/circle: width in mm. Cylinder: diameter in mm. */
  width: number;
  /** Cylinder only: height in mm. */
  cylinderHeight: number;
  arcAngle: number;
  minThickness: number;
  maxThickness: number;
  resolution: number;
  // image adjustments
  aspect: Aspect;
  zoom: number;
  panX: number;
  panY: number;
  brightness: number; // -1..1
  contrast: number; // -1..1
  gamma: number;
  autoEnhance: boolean;
  invert: boolean;
  mirror: boolean;
  // extras
  frame: "none" | "border" | "frame";
  frameWidth: number;
  frameDepth: number;
  stand: boolean;
  hole: "none" | "tab" | "loop" | "inside";
  holeDiameter: number;
  cylinderBase: "open" | "ring";
  lightHole: number;
  text: string;
  textFont: FontKey;
  textPosition: "bottom" | "top";
  textSize: number; // % of image height
  textStyle: "engraved" | "raised";
}

export const LITHO_DEFAULTS: LithoSettings = {
  shape: "flat",
  width: 100,
  cylinderHeight: 100,
  arcAngle: 120,
  minThickness: 0.6,
  maxThickness: 3,
  resolution: 180,
  aspect: "original",
  zoom: 1,
  panX: 0,
  panY: 0,
  brightness: 0,
  contrast: 0,
  gamma: 1,
  autoEnhance: false,
  invert: false,
  mirror: false,
  frame: "border",
  frameWidth: 3,
  frameDepth: 5,
  stand: false,
  hole: "none",
  holeDiameter: 4,
  cylinderBase: "ring",
  lightHole: 40,
  text: "",
  textFont: "inter",
  textPosition: "bottom",
  textSize: 10,
  textStyle: "engraved",
};

export const PLA_DENSITY = 1.24; // g/cm³
export const FILAMENT_DIAMETER = 1.75; // mm
/** Rough volumetric rate at 0.12 mm layers and 100% infill, used only for the time estimate. */
export const EST_FLOW_MM3_S = 4;
