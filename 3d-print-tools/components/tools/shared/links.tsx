"use client";

import { createContext, useContext } from "react";

/**
 * slug → short name for every tool page, passed down from the server so client
 * bundles don't include the full page copy just to render a few links.
 */
const Ctx = createContext<Record<string, string>>({});

export function ToolLinksProvider({ links, children }: { links: Record<string, string>; children: React.ReactNode }) {
  return <Ctx.Provider value={links}>{children}</Ctx.Provider>;
}

export const useToolLinks = () => useContext(Ctx);
