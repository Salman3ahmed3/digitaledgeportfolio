import { ImageResponse } from "next/og";
import { SITE } from "@/site.config";

export const ogSize = { width: 1200, height: 630 };

/** Build-time OG image: brand mark, page title and a short subtitle. */
export function renderOg(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0b1120 0%, #11285a 60%, #1667e8 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 700 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d="M16 3 28 9.5v13L16 29 4 22.5v-13z" fill="#2b7fff" />
            <path d="M16 3 28 9.5 16 16 4 9.5z" fill="#7fb4ff" />
            <path d="M16 16v13l12-6.5v-13z" fill="#1152bd" />
          </svg>
          {SITE.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
          <div style={{ fontSize: 34, color: "#c7dbff" }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 26, color: "#e2ecff" }}>
          {["Free", "No signup", "Unlimited", "Files stay on your device"].map((c) => (
            <div key={c} style={{ display: "flex", border: "2px solid rgba(255,255,255,0.35)", borderRadius: 999, padding: "8px 22px" }}>
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    ogSize,
  );
}
