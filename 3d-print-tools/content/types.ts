export type Engine = "image" | "svg" | "lithophane" | "viewer";
export type ExportFormat = "stl" | "obj" | "3mf" | "glb" | "ply";
export type ToolCategory = "convert" | "make" | "view";

export interface QA { q: string; a: string }
export interface NamedText { name: string; text: string }

/** One indexable tool page. Copy lives here; behaviour comes from `engine` + `preset`. */
export interface ToolPage {
  slug: string;
  engine: Engine;
  /** Engine-specific default overrides (see lib/engines/<engine>/settings.ts). */
  preset?: Record<string, unknown>;
  defaultFormat?: ExportFormat;
  category: ToolCategory;
  /** Short label for menus and cards. */
  shortName: string;
  /** One-line card description on the home page. */
  cardText: string;
  /** <title> without the brand suffix. */
  title: string;
  metaDescription: string;
  h1: string;
  valueLine: string;
  intro: string[];
  howTo: NamedText[];
  settings: NamedText[];
  useCases: { title: string; text: string }[];
  printTips: string[];
  faq: QA[];
  related: string[];
  /** Optional "convert from / to" link groups; only slugs that exist are rendered. */
  convertFrom?: string[];
  convertTo?: string[];
  /** ISO date of last meaningful content edit (used in sitemap). */
  updated: string;
}

export interface GuideSection { heading: string; body: string[]; list?: string[]; table?: string[][] }
export interface Guide {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  summary: string;
  updated: string;
  sections: GuideSection[];
  faq?: QA[];
  relatedTools: string[];
}
