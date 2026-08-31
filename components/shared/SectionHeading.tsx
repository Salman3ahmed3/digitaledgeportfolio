import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/shared/Reveal";

/**
 * Standard section heading block: optional eyebrow badge, H2, and subhead.
 * Keeps every section's header typographically consistent.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  titleClassName?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? <Badge variant="default">{eyebrow}</Badge> : null}
      <h2
        className={cn(
          "max-w-3xl font-display text-[clamp(2rem,4vw,3.25rem)] font-800 leading-[1.1] tracking-tightest text-navy-900",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-lg leading-relaxed text-ink-600",
            align === "center" ? "mx-auto" : "",
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
