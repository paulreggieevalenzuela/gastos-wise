"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { useAccent } from "@/components/theme/accent-provider";
import { ACCENT_QUICK_PICKS, buildThemeVars, isValidHexColor } from "@/lib/color";
import { cn } from "@/lib/utils";

const PREVIEW_TOKENS = ["bg", "surface-raised", "accent-soft", "accent", "accent-strong"] as const;

export function AccentPicker({ onChange }: { onChange?: (hex: string) => void }) {
  const { accent, setAccent } = useAccent();
  const { resolvedTheme } = useTheme();
  const [hexInput, setHexInput] = useState(accent.toUpperCase());

  useEffect(() => setHexInput(accent.toUpperCase()), [accent]);

  function commit(hex: string) {
    const normalized = hex.startsWith("#") ? hex : `#${hex}`;
    if (!isValidHexColor(normalized)) return;
    setAccent(normalized);
    onChange?.(normalized);
  }

  const isCustom = !ACCENT_QUICK_PICKS.some((p) => p.hex.toLowerCase() === accent.toLowerCase());
  const preview = buildThemeVars(accent, resolvedTheme === "dark" ? "dark" : "light");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ACCENT_QUICK_PICKS.map((option) => {
          const selected = accent.toLowerCase() === option.hex.toLowerCase();
          return (
            <button
              key={option.hex}
              type="button"
              title={option.label}
              aria-label={`Use ${option.label} accent`}
              aria-pressed={selected}
              onClick={() => commit(option.hex)}
              className={cn(
                "gw-press flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition-shadow",
                selected ? "ring-2 ring-ink" : "hover:ring-2 hover:ring-border-strong",
              )}
              style={{ backgroundColor: option.hex }}
            >
              {selected && <Check size={14} className="text-white" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <label
          title="Pick any color"
          className={cn(
            "gw-press relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full p-[3px]",
            isCustom && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
          )}
          style={{
            background:
              "conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)",
          }}
        >
          <span className="h-full w-full rounded-full border-2 border-surface" style={{ backgroundColor: accent }} />
          <input
            type="color"
            value={accent}
            onChange={(e) => commit(e.target.value)}
            aria-label="Pick a custom accent color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value.toUpperCase())}
          onBlur={() => {
            const v = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
            if (isValidHexColor(v)) commit(v);
            else setHexInput(accent.toUpperCase());
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="#1F6F54"
          maxLength={7}
          spellCheck={false}
          aria-label="Accent color hex code"
          className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 font-mono text-xs uppercase text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </div>

      <div>
        <div className="flex overflow-hidden rounded-lg border border-border">
          {PREVIEW_TOKENS.map((token) => (
            <span
              key={token}
              className="h-5 flex-1"
              style={{ backgroundColor: `rgb(${preview[token]})` }}
              title={token}
            />
          ))}
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-ink-faint">
          Backgrounds, cards, and buttons are all shaded from this color.
        </p>
      </div>
    </div>
  );
}
