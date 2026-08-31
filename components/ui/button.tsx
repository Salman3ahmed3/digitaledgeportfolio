import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button variants — the single source of truth for CTA styling.
 *
 * `primary`   → gradient CTA (brand blue), the macro-conversion button.
 * `secondary` → navy outline that fills navy on hover (ghost → solid).
 * `ghost`     → low-emphasis text button.
 * `outline` / `link` → utility variants for forms, footers, etc.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-cta text-white shadow-cta hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-8px_rgba(30,91,255,0.55)] active:translate-y-0",
        secondary:
          "border-[1.5px] border-navy-900 bg-transparent text-navy-900 hover:-translate-y-0.5 hover:bg-navy-900 hover:text-white active:translate-y-0",
        ghost:
          "bg-transparent text-navy-900 hover:bg-brand-100 hover:text-brand-600",
        outline:
          "border border-ink-100 bg-white text-navy-900 hover:border-brand-600 hover:text-brand-600",
        link: "text-brand-600 underline-offset-4 hover:underline",
        white:
          "bg-white text-navy-900 shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0",
      },
      size: {
        default: "px-6 py-3.5 md:px-7 md:py-4",
        sm: "px-4 py-2.5 text-sm",
        lg: "px-8 py-4 text-lg md:px-9 md:py-5",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
