import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Horizontal content container with a consistent max width + responsive gutters.
 * Wrap every section's inner content in this for aligned edges site-wide.
 */
export function Container({
  className,
  as: Comp = "div",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
}) {
  return (
    <Comp
      className={cn("mx-auto w-full max-w-[1200px] px-6 md:px-8", className)}
      {...props}
    />
  );
}
