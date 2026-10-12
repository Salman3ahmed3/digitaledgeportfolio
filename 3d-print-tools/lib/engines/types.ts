/** 2D point list; closed polygons do not repeat the first point. */
export type Poly = [number, number][];

export interface Stroke {
  points: Poly;
  closed: boolean;
  width: number; // in source units
}

/** One drawable group of shapes sharing a colour. Source units, Y down. */
export interface Layer {
  id: string;
  color: string; // #rrggbb
  name: string;
  fills: { polys: Poly[]; rule: "EvenOdd" | "NonZero" }[];
  strokes: Stroke[];
  /** Fraction of the document bounds covered by this layer's bbox (background detection). */
  coverage: number;
  openFillPaths: number;
}

export interface VectorInput {
  layers: Layer[];
  /** Bounds of all geometry in source units. */
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface BuiltPart {
  name: string;
  color?: string;
  positions: Float32Array;
  indices: Uint32Array;
}

export interface BuildResult {
  parts: BuiltPart[];
  size: [number, number, number];
  triangles: number;
  volume: number;
  watertight: boolean;
  warnings: string[];
}

export class UserError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "UserError";
  }
}
