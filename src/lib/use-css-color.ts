"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAccent } from "@/components/theme/accent-provider";

/**
 * Resolves a `--color-*` CSS custom property (stored as an "R G B" triplet,
 * see globals.css) to an `rgb(...)` string, recomputed whenever the theme
 * or accent changes. Recharts fill/stroke props are safest as concrete
 * color strings rather than relying on var() inside SVG presentation
 * attributes across all browsers.
 */
export function useCssColor(variableName: string, fallback = "rgb(0 0 0)"): string {
  const { resolvedTheme } = useTheme();
  const { accent } = useAccent();
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    if (value) setColor(`rgb(${value})`);
  }, [variableName, resolvedTheme, accent]);

  return color;
}
