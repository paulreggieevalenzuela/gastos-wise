"use client";

import { useEffect, useState } from "react";
import { useAccent } from "@/components/theme/accent-provider";
import { ACCENT_QUICK_PICKS, isValidHexColor } from "@/lib/color";
import { cn } from "@/lib/utils";

export function AccentPicker({ onChange }: { onChange?: (hex: string) => void }) {
  const { accent, setAccent } = useAccent();
  const [hexInput, setHexInput] = useState(accent);

  useEffect(() => setHexInput(accent), [accent]);

  function commit(hex: string) {
    if (!isValidHexColor(hex)) return;
    setAccent(hex);
    onChange?.(hex);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {ACCENT_QUICK_PICKS.map((option) => (
          <button
            key={option.hex}
            type="button"
            title={option.label}
            aria-label={`Use ${option.label} accent`}
            aria-pressed={accent.toLowerCase() === option.hex.toLowerCase()}
            onClick={() => commit(option.hex)}
            className={cn(
              "h-7 w-7 shrink-0 rounded-full ring-offset-2 ring-offset-surface transition-shadow",
              accent.toLowerCase() === option.hex.toLowerCase()
                ? "ring-2 ring-ink"
                : "ring-1 ring-border hover:ring-border-strong",
            )}
            style={{ backgroundColor: option.hex }}
          />
        ))}

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <label
          title="Pick a custom color"
          className="relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-border hover:ring-border-strong"
          style={{ backgroundColor: accent }}
        >
          <input
            type="color"
            value={isValidHexColor(accent) ? accent : "#1f6f54"}
            onChange={(e) => commit(e.target.value)}
            aria-label="Pick a custom accent color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onBlur={() => (isValidHexColor(hexInput) ? commit(hexInput) : setHexInput(accent))}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          placeholder="#1F6F54"
          maxLength={7}
          className="w-28 rounded-md border border-border bg-surface px-2 py-1 font-mono text-xs text-ink"
        />
        <span className="text-xs text-ink-faint">Any color works — shades are generated for you.</span>
      </div>
    </div>
  );
}
