import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Brand palette extracted from the Digital Edge logo
        navy: {
          900: "#0A1F44", // Primary dark
          700: "#142C5C",
        },
        brand: {
          // Primary brand blue scale
          600: "#1E5BFF",
          500: "#3B72FF",
          100: "#E8F0FF", // Soft blue tint for backgrounds
        },
        ink: {
          900: "#0F172A", // Body text (slate-900)
          600: "#475569", // Secondary text (slate-600)
          100: "#F1F5F9", // Section dividers (slate-100)
        },
        "off-white": "#FAFBFC", // Alternate section background
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #0A1F44 0%, #1E5BFF 100%)",
        "gradient-cta": "linear-gradient(135deg, #1E5BFF 0%, #3B72FF 100%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.02em",
      },
      lineHeight: {
        relaxed: "1.65",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        cta: "0 12px 30px -8px rgba(30, 91, 255, 0.45)",
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 12px 32px -12px rgba(15, 23, 42, 0.12)",
        "card-hover":
          "0 4px 8px rgba(15, 23, 42, 0.08), 0 24px 48px -16px rgba(15, 23, 42, 0.22)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
