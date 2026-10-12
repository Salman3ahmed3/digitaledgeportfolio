declare module "opentype.js" {
  export interface PathCommand {
    type: "M" | "L" | "Q" | "C" | "Z";
    x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number;
  }
  export interface RenderOptions { kerning?: boolean; letterSpacing?: number; features?: Record<string, boolean> }
  export interface Glyph {
    advanceWidth?: number;
    getPath(x: number, y: number, fontSize: number): { commands: PathCommand[] };
  }
  export interface Font {
    charToGlyph(c: string): Glyph;
    getKerningValue(left: Glyph, right: Glyph): number;
    unitsPerEm: number;
    getPath(text: string, x: number, y: number, fontSize: number, options?: RenderOptions): { commands: PathCommand[] };
    getAdvanceWidth(text: string, fontSize: number, options?: RenderOptions): number;
  }
  export function parse(buffer: ArrayBuffer): Font;
}
