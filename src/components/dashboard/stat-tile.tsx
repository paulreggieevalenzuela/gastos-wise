import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p
        className={cn(
          "font-tabular mt-2 font-display text-2xl text-ink",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
