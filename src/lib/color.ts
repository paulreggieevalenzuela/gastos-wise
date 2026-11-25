/**
 * Small color-math helpers for the custom accent-color picker. Given any
 * hex color the user picks, these derive the readable "ink" (text) color
 * to put on top of it, and a soft tint for subtle backgrounds — the same
 * three roles the old fixed emerald/navy/plum/rust presets each hand-picked
 * manually (--color-accent / --color-accent-ink / --color-accent-soft).
 */

export type Rgb = [number, number, number];

export const DEFAULT_ACCENT_HEX = "#1F6F54";

const LEGACY_ACCENT_HEX: Record<string, string> = {
  emerald: DEFAULT_ACCENT_HEX,
  navy: "#2A4C7C",
  plum: "#6C3F63",
  rust: "#8D4428",
};

/** Accepts a hex string ("#rrggbb"/"rrggbb") or an old preset key; always returns a hex string. */
export function resolveAccentHex(stored: string | null | undefined): string {
  if (!stored) return DEFAULT_ACCENT_HEX;
  if (stored.startsWith("#")) return isValidHexColor(stored) ? stored : DEFAULT_ACCENT_HEX;
  return LEGACY_ACCENT_HEX[stored] ?? DEFAULT_ACCENT_HEX;
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

export function rgbToTriplet([r, g, b]: Rgb): string {
  return `${r} ${g} ${b}`;
}

function linearChannel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function srgbLuminance([r, g, b]: Rgb): number {
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b);
}

function mix(c1: Rgb, c2: Rgb, t: number): Rgb {
  return [
    Math.round(c1[0] * (1 - t) + c2[0] * t),
    Math.round(c1[1] * (1 - t) + c2[1] * t),
    Math.round(c1[2] * (1 - t) + c2[2] * t),
  ];
}

const WHITE: Rgb = [255, 255, 255];
const DARK_INK: Rgb = [20, 28, 24];
const DARK_SURFACE: Rgb = [28, 40, 34]; // matches .dark --color-surface-raised in globals.css

export interface AccentVars {
  accent: Rgb;
  accentInk: Rgb;
  accentSoft: Rgb;
}

/** Derives the full accent/accent-ink/accent-soft trio from one picked hex, for the given mode. */
export function computeAccentVars(hex: string, isDark: boolean): AccentVars {
  const accent = hexToRgb(isValidHexColor(hex) ? hex : DEFAULT_ACCENT_HEX);
  const luminance = srgbLuminance(accent);
  const accentInk: Rgb = luminance > 0.42 ? DARK_INK : WHITE;
  const accentSoft: Rgb = isDark ? mix(accent, DARK_SURFACE, 0.78) : mix(accent, WHITE, 0.84);
  return { accent, accentInk, accentSoft };
}

export function applyAccentVars(el: HTMLElement, vars: AccentVars) {
  el.style.setProperty("--color-accent", rgbToTriplet(vars.accent));
  el.style.setProperty("--color-accent-ink", rgbToTriplet(vars.accentInk));
  el.style.setProperty("--color-accent-soft", rgbToTriplet(vars.accentSoft));
}

/** A handful of good-looking defaults shown as quick picks alongside the raw color input. */
export const ACCENT_QUICK_PICKS = [
  { label: "Emerald", hex: "#1F6F54" },
  { label: "Navy", hex: "#2A4C7C" },
  { label: "Plum", hex: "#6C3F63" },
  { label: "Rust", hex: "#8D4428" },
  { label: "Indigo", hex: "#4B4FA3" },
  { label: "Teal", hex: "#1C7A77" },
] as const;
