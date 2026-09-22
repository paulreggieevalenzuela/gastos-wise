"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const ACCENT_OPTIONS = [
  { value: "emerald", label: "Emerald", swatch: "rgb(31 111 84)" },
  { value: "navy", label: "Navy", swatch: "rgb(42 76 124)" },
  { value: "plum", label: "Plum", swatch: "rgb(108 63 99)" },
  { value: "rust", label: "Rust", swatch: "rgb(141 68 40)" },
] as const;

export type AccentColor = (typeof ACCENT_OPTIONS)[number]["value"];

const ACCENT_STORAGE_KEY = "expense-tracker-accent";

interface AccentContextValue {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
}

const AccentContext = createContext<AccentContextValue | null>(null);

/**
 * Applies the accent as a data-attribute on <html> (see globals.css for the
 * [data-accent] token overrides) and persists it to localStorage for an
 * instant, no-flash read on the next visit. See AccentInitScript for the
 * pre-hydration version of this same logic.
 */
export function AccentProvider({
  children,
  initialAccent = "emerald",
}: {
  children: React.ReactNode;
  initialAccent?: AccentColor;
}) {
  const [accent, setAccentState] = useState<AccentColor>(initialAccent);

  useEffect(() => {
    const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null;
    if (stored && ACCENT_OPTIONS.some((o) => o.value === stored)) {
      setAccentState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  const setAccent = useCallback((next: AccentColor) => {
    setAccentState(next);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, next);
  }, []);

  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used within AccentProvider");
  return ctx;
}

/** Inline, pre-hydration script that sets data-accent before first paint (no flash of default color). */
export function AccentInitScript() {
  const script = `
    (function () {
      try {
        var stored = window.localStorage.getItem("${ACCENT_STORAGE_KEY}");
        if (stored) document.documentElement.dataset.accent = stored;
      } catch (e) {}
    })();
  `;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
