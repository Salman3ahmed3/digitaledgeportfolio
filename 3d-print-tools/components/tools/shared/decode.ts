import type { Rgba } from "@/lib/engines/image/pixels";

export const RASTER_ACCEPT = ".png,.jpg,.jpeg,.webp,.gif,.bmp,image/png,image/jpeg,image/webp";

export async function openBitmap(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error("This image couldn't be decoded. Use a PNG, JPG or WebP file.");
  }
}

/**
 * Draw (optionally cropped/zoomed) bitmap into an RGBA buffer whose long edge
 * is at most `maxEdge` px.
 */
export function rasterize(
  bmp: ImageBitmap,
  maxEdge: number,
  crop?: { x: number; y: number; w: number; h: number },
  adjust?: (ctx: CanvasRenderingContext2D) => void,
): Rgba {
  const src = crop ?? { x: 0, y: 0, w: bmp.width, h: bmp.height };
  const k = Math.min(1, maxEdge / Math.max(src.w, src.h));
  const w = Math.max(2, Math.round(src.w * k));
  const h = Math.max(2, Math.round(src.h * k));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  adjust?.(ctx);
  ctx.drawImage(bmp, src.x, src.y, src.w, src.h, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h);
  return { data: d.data, width: w, height: h };
}
