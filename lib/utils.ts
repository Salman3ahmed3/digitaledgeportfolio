import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names with conflict resolution.
 * Used throughout the UI primitives (shadcn/ui convention).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
