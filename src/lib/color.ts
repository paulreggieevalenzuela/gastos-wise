/**
 * Theme engine for the custom accent-color picker.
 *
 * From the single hex color a user picks, this derives the *whole* app
 * palette — page background, card surfaces, borders, text, and the accent
 * itself plus a darker/softer shade — for both light and dark mode. Every
 * neutral is tinted with the picked hue (at low saturation), so choosing
 * indigo makes the app feel indigo throughout, not just the buttons.
 *
 * The result is emitted as a small CSS string (`buildThemeCss`) that the
 * root layout renders server-side from the user's saved color, and that the
 * client re-renders instantly when the color changes. Semantic colors
 * (positive/negative/warning) stay fixed so money in and out always reads
 * the same way.
 */

export type Rgb = [number, number, number];

export const DEFAULT_ACCENT_HEX = "#1F6F54";
export const ACCENT_STORAGE_KEY = "expense-tracker-accent";
export const THEME_CSS_STORAGE_KEY = "gw-theme-css";
export const THEME_STYLE_ID = "gw-theme";

const LEGACY_ACCENT_HEX: Record<string, string> = {
  emerald: DEFAULT_ACCENT_HEX,
  navy: "#2A4C7C",
  plum: "#6C3F63",
  rust: "#8D4428",
};

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

/** Accepts a hex string or an old preset key ("emerald", …); always returns a valid hex. */
export function resolveAccentHex(stored: string | null | undefined): string {
  if (!stored) return DEFAULT_ACCENT_HEX;
  if (stored.startsWith("#")) return isValidHexColor(stored) ? stored : DEFAULT_ACCENT_HEX;
  return LEGACY_ACCENT_HEX[stored] ?? DEFAULT_ACCENT_HEX;
}

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

/** h in degrees, s and l in 0–1. */
function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = l - c / 2;
  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}

function linearChannel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b);
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const triplet = ([r, g, b]: Rgb) => `${r} ${g} ${b}`;

export type ThemeVars = Record<string, string>;

/** The full set of `--color-*` variables for one mode, derived from the picked hex. */
export function buildThemeVars(hex: string, mode: "light" | "dark"): ThemeVars {
  const [h, s, l] = rgbToHsl(hexToRgb(resolveAccentHex(hex)));
  // How strongly neutrals take on the hue: grey picks stay grey, vivid picks tint gently.
  const tint = clamp(s, 0, 1);

  if (mode === "light") {
    const accentL = clamp(l, 0.28, 0.52);
    const accent = hslToRgb(h, s, accentL);
    return {
      bg: triplet(hslToRgb(h, 0.22 * tint, 0.965)),
      surface: triplet(hslToRgb(h, 0.3 * tint, 0.995)),
      "surface-raised": triplet(hslToRgb(h, 0.2 * tint, 0.93)),
      border: triplet(hslToRgb(h, 0.16 * tint, 0.885)),
      "border-strong": triplet(hslToRgb(h, 0.12 * tint, 0.78)),
      ink: triplet(hslToRgb(h, 0.3 * tint, 0.12)),
      "ink-muted": triplet(hslToRgb(h, 0.1 * tint, 0.38)),
      "ink-faint": triplet(hslToRgb(h, 0.08 * tint, 0.57)),
      accent: triplet(accent),
      "accent-strong": triplet(hslToRgb(h, clamp(s * 1.05, 0, 1), clamp(accentL - 0.12, 0.12, 0.4))),
      "accent-soft": triplet(hslToRgb(h, clamp(s * 0.7, 0, 0.8), 0.92)),
      "accent-ink": luminance(accent) > 0.42 ? "20 24 22" : "255 255 255",
    };
  }

  const accentL = clamp(l, 0.55, 0.7);
  const accent = hslToRgb(h, clamp(s, 0, 0.85), accentL);
  return {
    bg: triplet(hslToRgb(h, 0.22 * tint, 0.065)),
    surface: triplet(hslToRgb(h, 0.18 * tint, 0.105)),
    "surface-raised": triplet(hslToRgb(h, 0.16 * tint, 0.145)),
    border: triplet(hslToRgb(h, 0.14 * tint, 0.19)),
    "border-strong": triplet(hslToRgb(h, 0.12 * tint, 0.28)),
    ink: triplet(hslToRgb(h, 0.18 * tint, 0.94)),
    "ink-muted": triplet(hslToRgb(h, 0.1 * tint, 0.7)),
    "ink-faint": triplet(hslToRgb(h, 0.08 * tint, 0.48)),
    accent: triplet(accent),
    "accent-strong": triplet(hslToRgb(h, clamp(s, 0, 0.85), clamp(accentL - 0.2, 0.25, 0.5))),
    "accent-soft": triplet(hslToRgb(h, clamp(s * 0.55, 0, 0.6), 0.17)),
    "accent-ink": luminance(accent) > 0.42 ? "10 14 12" : "255 255 255",
  };
}

function varsToDeclarations(vars: ThemeVars): string {
  return Object.entries(vars)
    .map(([name, value]) => `--color-${name}:${value};`)
    .join("");
}

/**
 * CSS for both modes. Selectors are `html:root` / `html.dark` so they
 * outrank the `:root` / `.dark` defaults in globals.css regardless of
 * which stylesheet loads first.
 */
export function buildThemeCss(hex: string): string {
  return (
    `html:root{${varsToDeclarations(buildThemeVars(hex, "light"))}}` +
    `html.dark{${varsToDeclarations(buildThemeVars(hex, "dark"))}}`
  );
}

/** Swaps the live theme <style> and remembers it for a flash-free next load. */
export function applyThemeCss(hex: string) {
  const css = buildThemeCss(hex);
  let el = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = THEME_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
  try {
    window.localStorage.setItem(THEME_CSS_STORAGE_KEY, css);
  } catch {
    // Private mode / storage disabled — the server-rendered theme still applies.
  }
}

/** A handful of good-looking defaults shown as quick picks alongside the raw color input. */
export const ACCENT_QUICK_PICKS = [
  { label: "Emerald", hex: "#1F6F54" },
  { label: "Indigo", hex: "#4B4FA3" },
  { label: "Ocean", hex: "#1D6FA3" },
  { label: "Teal", hex: "#1C7A77" },
  { label: "Plum", hex: "#6C3F63" },
  { label: "Rose", hex: "#B23A5B" },
  { label: "Rust", hex: "#8D4428" },
  { label: "Amber", hex: "#B7791F" },
] as const;
