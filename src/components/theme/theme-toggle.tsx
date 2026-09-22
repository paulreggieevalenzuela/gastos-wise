"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="inline-flex items-center rounded-md border border-border bg-surface p-0.5 text-xs">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => setTheme(mode.value)}
          className={cn(
            "rounded-[5px] px-2.5 py-1.5 font-medium transition-colors",
            mounted && theme === mode.value
              ? "bg-accent text-accent-ink"
              : "text-ink-muted hover:text-ink",
          )}
          aria-pressed={mounted && theme === mode.value}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
