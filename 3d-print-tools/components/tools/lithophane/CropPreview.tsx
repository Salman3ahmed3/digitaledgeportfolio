"use client";

import { useEffect, useRef } from "react";
import { luminance } from "@/lib/engines/image/pixels";
import { adjustLuminance, cropRect } from "@/lib/engines/lithophane/adjust";
import type { LithoSettings } from "@/lib/engines/lithophane/settings";
import { rasterize } from "../shared/decode";

/**
 * Live 2D preview of the cropped, adjusted image as it will be printed.
 * Drag to pan; zoom comes from the Zoom setting.
 */
export function CropPreview({
  bitmap, s, aspect, onPan,
}: {
  bitmap: ImageBitmap; s: LithoSettings; aspect: number;
  onPan: (x: number, y: number) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const crop = cropRect(bitmap.width, bitmap.height, aspect, s.zoom, s.panX, s.panY);
    const img = rasterize(bitmap, 320, crop);
    const lum = adjustLuminance(luminance(img), s);
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d")!;
    const out = ctx.createImageData(img.width, img.height);
    for (let i = 0; i < lum.length; i++) {
      const x = i % img.width, y = (i - x) / img.width;
      const src = s.mirror ? y * img.width + (img.width - 1 - x) : i;
      const v = Math.round(lum[src] * 255);
      out.data[i * 4] = v; out.data[i * 4 + 1] = v; out.data[i * 4 + 2] = v; out.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }, [bitmap, s, aspect]);

  const clipShape = s.shape === "circle" ? "circle(50%)" : s.shape === "heart" ? "url(#heart-clip)" : undefined;

  return (
    <div className="space-y-1">
      <div className="flex justify-center rounded-lg bg-black/5 p-2 dark:bg-white/5">
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.97 C0.2,0.75 0,0.55 0,0.3 C0,0.12 0.13,0 0.28,0 C0.38,0 0.46,0.06 0.5,0.14 C0.54,0.06 0.62,0 0.72,0 C0.87,0 1,0.12 1,0.3 C1,0.55 0.8,0.75 0.5,0.97 Z" />
          </clipPath>
        </svg>
        <canvas
          ref={canvas}
          aria-label="Cropped image preview. Drag to move the picture."
          role="img"
          className="max-h-48 w-auto max-w-full cursor-grab touch-none active:cursor-grabbing"
          style={{ clipPath: clipShape, aspectRatio: String(aspect) }}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY, px: s.panX, py: s.panY };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const k = 2 / Math.max(1, s.zoom - 1 + 0.5);
            const nx = Math.max(-1, Math.min(1, d.px - ((e.clientX - d.x) / rect.width) * k));
            const ny = Math.max(-1, Math.min(1, d.py - ((e.clientY - d.y) / rect.height) * k));
            onPan(+nx.toFixed(3), +ny.toFixed(3));
          }}
          onPointerUp={() => (drag.current = null)}
        />
      </div>
      <p className="text-center text-xs text-[var(--muted)]">Drag to reposition · use Zoom to crop tighter · light areas will glow</p>
    </div>
  );
}
