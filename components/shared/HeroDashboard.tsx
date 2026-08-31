"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, TrendingUp, Target } from "lucide-react";

import { CountUp } from "@/components/shared/CountUp";

/**
 * Hero dashboard graphic — a stylized "results" panel (revenue trend + ROAS +
 * live campaign card). Pure SVG/React, no external asset needed.
 *
 * TODO(user): Swap for a real product/dashboard screenshot when available, e.g.
 *   <Image src="/images/hero-dashboard.png" alt="..." width={640} height={520} priority />
 */
export function HeroDashboard() {
  const reduceMotion = useReducedMotion();

  // Revenue trend polyline points (upward trend).
  const points = [
    [0, 150],
    [50, 138],
    [100, 120],
    [150, 128],
    [200, 96],
    [250, 78],
    [300, 82],
    [350, 44],
    [400, 26],
  ];
  const linePath = points.map((p) => p.join(",")).join(" ");
  const areaPath = `0,160 ${linePath} 400,160`;

  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-brand-600/20 via-brand-500/10 to-transparent blur-2xl" />

      <div className="rounded-2xl border border-white/60 bg-white/95 p-5 shadow-[0_30px_80px_-30px_rgba(10,31,68,0.45)] backdrop-blur">
        {/* Header row */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Revenue · Last 90 days
            </p>
            <p className="mt-1 font-display text-2xl font-800 tracking-tightest text-navy-900">
              <CountUp value={284900} prefix="$" duration={1800} />
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-700 text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            +182%
          </span>
        </div>

        {/* Chart */}
        <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-b from-brand-100/60 to-white">
          <svg
            viewBox="0 0 400 160"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E5BFF" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#1E5BFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPath} fill="url(#hero-area)" />
            <motion.polyline
              points={linePath}
              fill="none"
              stroke="#1E5BFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? undefined : { pathLength: 0 }}
              whileInView={reduceMotion ? undefined : { pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Metric cards */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-ink-100 bg-off-white p-4">
            <div className="flex items-center gap-2 text-ink-600">
              <Target className="h-4 w-4 text-brand-600" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                ROAS
              </span>
            </div>
            <p className="mt-2 font-display text-2xl font-800 text-navy-900">
              <CountUp value={4.2} decimals={1} suffix="x" duration={1600} />
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-off-white p-4">
            <div className="flex items-center gap-2 text-ink-600">
              <ArrowUpRight className="h-4 w-4 text-brand-600" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                CPL
              </span>
            </div>
            <p className="mt-2 font-display text-2xl font-800 text-navy-900">
              <CountUp value={38} prefix="-" suffix="%" duration={1600} />
            </p>
          </div>
        </div>

        {/* Live campaign card */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-navy-900 p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <div>
              <p className="text-sm font-700">Meta · Prospecting</p>
              <p className="text-xs text-white/60">Scaling · Live</p>
            </div>
          </div>
          <p className="font-display text-lg font-800 text-brand-100">
            <CountUp value={11240} prefix="$" duration={1800} />
          </p>
        </div>
      </div>
    </div>
  );
}
