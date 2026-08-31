"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Lightweight count-up animation for result metrics.
 * Animates from 0 → `value` once the element scrolls into view, using
 * requestAnimationFrame with an ease-out curve. Honors reduced-motion by
 * rendering the final value immediately.
 */
export function CountUp({
  value,
  duration = 1600,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(reduceMotion ? value : 0);

  React.useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let started = false;

    const animate = (start: number) => {
      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(value * eased);
        if (progress < 1) {
          raf = requestAnimationFrame(step);
        }
      };
      raf = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            animate(performance.now());
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reduceMotion]);

  const formatted = display.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
