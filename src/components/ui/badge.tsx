import { cn } from "@/lib/utils";

type Tone = "positive" | "negative" | "warning" | "neutral" | "accent";

const toneClasses: Record<Tone, string> = {
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-surface-raised text-ink-muted",
  accent: "bg-accent-soft text-accent",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
