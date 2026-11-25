"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  ACCENT_STORAGE_KEY,
  THEME_CSS_STORAGE_KEY,
  THEME_STYLE_ID,
  applyThemeCss,
  buildThemeCss,
  resolveAccentHex,
} from "@/lib/color";

interface AccentContextValue {
  /** Always a "#rrggbb" hex string. */
  accent: string;
  setAccent: (hex: string) => void;
}

const AccentContext = createContext<AccentContextValue | null>(null);

/**
 * Holds the picked accent color and keeps the generated theme stylesheet
 * (see buildThemeCss in lib/color.ts) in sync with it. For signed-in users
 * the color saved on their account wins; signed-out pages fall back to the
 * last color used on this device.
 */
export function AccentProvider({
  children,
  initialAccent,
}: {
  children: React.ReactNode;
  initialAccent?: string | null;
}) {
  const [accent, setAccentState] = useState<string>(resolveAccentHex(initialAccent));

  useEffect(() => {
    if (initialAccent) return;
    try {
      const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
      if (stored) setAccentState(resolveAccentHex(stored));
    } catch {
      // storage unavailable — keep the default
    }
  }, [initialAccent]);

  useEffect(() => {
    applyThemeCss(accent);
  }, [accent]);

  const setAccent = useCallback((hex: string) => {
    setAccentState(hex);
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, hex);
    } catch {
      // ignore
    }
  }, []);

  return <AccentContext.Provider value={{ accent, setAccent }}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used within AccentProvider");
  return ctx;
}

/**
 * Server-rendered theme stylesheet built from the signed-in user's saved
 * color, so the very first paint is already in their colors on any device.
 */
export function ThemeStyle({ accent }: { accent?: string | null }) {
  return (
    <style
      id={THEME_STYLE_ID}
      data-source={accent ? "user" : "default"}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: buildThemeCss(resolveAccentHex(accent)) }}
    />
  );
}

/**
 * For signed-out pages (landing, login): applies the theme last used on
 * this device before first paint. Must render after <ThemeStyle />.
 */
export function AccentInitScript() {
  const script = `(function(){try{var el=document.getElementById("${THEME_STYLE_ID}");if(!el||el.getAttribute("data-source")==="user")return;var css=window.localStorage.getItem("${THEME_CSS_STORAGE_KEY}");if(css)el.textContent=css;}catch(e){}})();`;
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
