import { SITE } from "@/site.config";

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-bold tracking-tight">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 3 28 9.5v13L16 29 4 22.5v-13z" fill="#2b7fff" />
        <path d="M16 3 28 9.5 16 16 4 9.5z" fill="#7fb4ff" />
        <path d="M16 16v13l12-6.5v-13z" fill="#1152bd" />
      </svg>
      <span>{SITE.name}</span>
    </span>
  );
}
