import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-100 text-brand-600 px-3 py-1 text-xs uppercase tracking-wide",
        outline:
          "border-ink-100 bg-white/70 text-ink-600 px-3 py-1 text-xs uppercase tracking-wide backdrop-blur",
        solid:
          "border-transparent bg-navy-900 text-white px-3 py-1 text-xs uppercase tracking-wide",
        popular:
          "border-transparent bg-gradient-cta text-white px-3.5 py-1 text-xs uppercase tracking-wide shadow-cta",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
