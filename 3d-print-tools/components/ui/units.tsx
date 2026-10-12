"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { loadJson, saveJson } from "@/lib/storage";

export type Units = "mm" | "in";
const Ctx = createContext<{ units: Units; setUnits: (u: Units) => void }>({ units: "mm", setUnits: () => {} });

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnitsState] = useState<Units>("mm");
  useEffect(() => {
    const u = loadJson<{ units: Units }>("pb:units")?.units;
    if (u === "in" || u === "mm") setUnitsState(u);
  }, []);
  const setUnits = (u: Units) => {
    setUnitsState(u);
    saveJson("pb:units", { units: u });
  };
  return <Ctx.Provider value={{ units, setUnits }}>{children}</Ctx.Provider>;
}

export const useUnits = () => useContext(Ctx);

export function fmtLen(mm: number, units: Units, digits = 1) {
  return units === "mm" ? `${mm.toFixed(digits)} mm` : `${(mm / 25.4).toFixed(digits + 1)} in`;
}

export function UnitsToggle() {
  const { units, setUnits } = useUnits();
  return (
    <div role="group" aria-label="Units" className="inline-flex overflow-hidden rounded-md border border-[var(--border)] text-xs">
      {(["mm", "in"] as const).map((u) => (
        <button
          key={u}
          type="button"
          aria-pressed={units === u}
          onClick={() => setUnits(u)}
          className={`px-2 py-1 ${units === u ? "bg-brand-600 text-white" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
