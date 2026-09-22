"use client";

import { ACCENT_OPTIONS, useAccent, type AccentColor } from "@/components/theme/accent-provider";
import { cn } from "@/lib/utils";

export function AccentPicker({ onChange }: { onChange?: (accent: AccentColor) => void }) {
  const { accent, setAccent } = useAccent();

  return (
    <div className="flex items-center gap-2">
      {ACCENT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.label}
          aria-label={`Use ${option.label} accent`}
          aria-pressed={accent === option.value}
          onClick={() => {
            setAccent(option.value);
            onChange?.(option.value);
          }}
          className={cn(
            "h-7 w-7 rounded-full ring-offset-2 ring-offset-surface transition-shadow",
            accent === option.value ? "ring-2 ring-ink" : "ring-1 ring-border hover:ring-border-strong",
          )}
          style={{ backgroundColor: option.swatch }}
        />
      ))}
    </div>
  );
}
