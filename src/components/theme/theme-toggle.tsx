"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
] as const;

export function ThemeToggle({
  onChange,
  className,
}: {
  onChange?: (mode: string) => void;
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={cn("grid grid-cols-3 gap-1 rounded-xl bg-surface-raised p-1 text-xs", className)}>
      {MODES.map((mode) => {
        const active = mounted && theme === mode.value;
        const Icon = mode.icon;
        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => {
              setTheme(mode.value);
              onChange?.(mode.value);
            }}
            className={cn(
              "gw-press flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 font-semibold transition-colors",
              active ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink",
            )}
            aria-pressed={active}
          >
            <Icon size={14} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
