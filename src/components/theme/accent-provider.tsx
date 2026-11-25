"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { applyAccentVars, computeAccentVars, resolveAccentHex } from "@/lib/color";

const ACCENT_STORAGE_KEY = "expense-tracker-accent";

interface AccentContextValue {
  /** Always a "#rrggbb" hex string — any legacy preset key is resolved before this is set. */
  accent: string;
  setAccent: (hex: string) => void;
}

const AccentContext = createContext<AccentContextValue | null>(null);

/**
 * Computes the accent/accent-ink/accent-soft CSS variables from whatever hex
 * color the user picked and applies them as inline styles on <html> — this
 * replaces the old fixed data-accent="emerald"/"navy"/... attribute, which
 * only worked for a handful of pre-compiled CSS blocks in globals.css.
 * Recomputes whenever the color or the light/dark mode changes, since the
 * soft tint is blended differently against each. See AccentInitScript for
 * the pre-hydration version of this same logic.
 */
export function AccentProvider({
  children,
  initialAccent = "#1F6F54",
}: {
  children: React.ReactNode;
  initialAccent?: string;
}) {
  const [accent, setAccentState] = useState<string>(resolveAccentHex(initialAccent));
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    if (stored) setAccentState(resolveAccentHex(stored));
  }, []);

  useEffect(() => {
    const vars = computeAccentVars(accent, resolvedTheme === "dark");
    applyAccentVars(document.documentElement, vars);
  }, [accent, resolvedTheme]);

  const setAccent = useCallback((hex: string) => {
    setAccentState(hex);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, hex);
  }, []);

  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used within AccentProvider");
  return ctx;
}

/** Inline, pre-hydration script that applies the accent vars before first paint (no flash of default color). */
export function AccentInitScript() {
  const script = `
    (function () {
      try {
        var LEGACY = { emerald: "#1F6F54", navy: "#2A4C7C", plum: "#6C3F63", rust: "#8D4428" };
        var stored = window.localStorage.getItem("${ACCENT_STORAGE_KEY}");
        var hex = stored ? (stored[0] === "#" ? stored : (LEGACY[stored] || LEGACY.emerald)) : null;
        if (!hex) return;
        var isDark = window.localStorage.getItem("theme") === "dark" ||
          (window.localStorage.getItem("theme") !== "light" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
        var r = parseInt(hex.substring(1, 3), 16);
        var g = parseInt(hex.substring(3, 5), 16);
        var b = parseInt(hex.substring(5, 7), 16);
        var a = [r, g, b].map(function (v) {
          var c = v / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        var luminance = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
        var ink = luminance > 0.42 ? "20 28 24" : "255 255 255";
        var mixWith = isDark ? [28, 40, 34] : [255, 255, 255];
        var t = isDark ? 0.78 : 0.84;
        var soft = [
          Math.round(r * (1 - t) + mixWith[0] * t),
          Math.round(g * (1 - t) + mixWith[1] * t),
          Math.round(b * (1 - t) + mixWith[2] * t),
        ].join(" ");
        var root = document.documentElement;
        root.style.setProperty("--color-accent", r + " " + g + " " + b);
        root.style.setProperty("--color-accent-ink", ink);
        root.style.setProperty("--color-accent-soft", soft);
      } catch (e) {}
    })();
  `;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
