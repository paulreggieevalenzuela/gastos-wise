import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Manrope everywhere; the Latin Extended subset follows as a fallback
        // so glyphs like ₱ still render in Manrope.
        sans: ["var(--font-manrope)", "var(--font-manrope-ext)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "var(--font-manrope-ext)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-raised": "rgb(var(--color-surface-raised) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        "border-strong": "rgb(var(--color-border-strong) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        "ink-faint": "rgb(var(--color-ink-faint) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-ink": "rgb(var(--color-accent-ink) / <alpha-value>)",
        "accent-strong": "rgb(var(--color-accent-strong) / <alpha-value>)",
        "accent-soft": "rgb(var(--color-accent-soft) / <alpha-value>)",
        positive: "rgb(var(--color-positive) / <alpha-value>)",
        "positive-soft": "rgb(var(--color-positive-soft) / <alpha-value>)",
        negative: "rgb(var(--color-negative) / <alpha-value>)",
        "negative-soft": "rgb(var(--color-negative-soft) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        "warning-soft": "rgb(var(--color-warning-soft) / <alpha-value>)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "28px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px -8px rgb(0 0 0 / 0.08)",
        float: "0 10px 30px -12px rgb(0 0 0 / 0.25), 0 2px 6px rgb(0 0 0 / 0.06)",
        glow: "0 12px 32px -12px rgb(var(--color-accent) / 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
