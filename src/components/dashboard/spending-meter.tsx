import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const TICKS = 36;

/**
 * Segmented spending meter: ticks shade from green to red across the
 * month's limit, with a marker at how much has been spent so far.
 */
export function SpendingMeter({
  spent,
  limit,
  available,
  limitSource,
  currency,
}: {
  spent: number;
  limit: number | null;
  available: number | null;
  limitSource: "budgets" | "income" | null;
  currency: string;
}) {
  if (limit === null || available === null) {
    return (
      <Card className="flex h-full flex-col justify-center p-5">
        <p className="text-[15px] font-bold text-ink">Monthly spending tracker</p>
        <p className="mt-1 text-sm text-ink-muted">
          Set a monthly budget or log your income to see how much room you have left this month.
        </p>
        <Link href="/budgets" className="mt-4 text-sm font-bold text-accent hover:underline">
          Set a budget →
        </Link>
      </Card>
    );
  }

  const ratio = Math.min(1, Math.max(0, spent / limit));
  const markerIndex = Math.round(ratio * (TICKS - 1));
  const over = available < 0;

  return (
    <Card className="h-full p-5">
      <p className="text-[15px] font-bold text-ink">Monthly spending tracker</p>
      <p className="mt-0.5 text-xs text-ink-muted">
        {limitSource === "budgets"
          ? "Measured against your monthly budgets."
          : "Measured against this month's income."}
      </p>

      <div className="relative mt-5 h-12" role="img" aria-label={`${Math.round(ratio * 100)}% of your limit used`}>
        <div className="gw-stagger flex h-full items-stretch gap-[3px]">
        {Array.from({ length: TICKS }).map((_, i) => {
          const t = i / (TICKS - 1);
          const color =
            t < 0.5
              ? `color-mix(in srgb, rgb(var(--color-positive)) ${Math.round((1 - t * 2) * 100)}%, rgb(var(--color-warning)))`
              : `color-mix(in srgb, rgb(var(--color-warning)) ${Math.round((1 - (t - 0.5) * 2) * 100)}%, rgb(var(--color-negative)))`;
          const filled = i <= markerIndex && spent > 0;
          // Dim unfilled ticks via the color itself — the entrance animation
          // owns `opacity`, so setting it here would be overridden.
          return (
            <span
              key={i}
              className="flex-1 rounded-full"
              style={{
                backgroundColor: filled ? color : `color-mix(in srgb, ${color} 22%, transparent)`,
                ["--i" as string]: i % 18,
              }}
            />
          );
        })}
        </div>
        <span
          aria-hidden
          className="absolute -bottom-1 -top-1 w-1.5 -translate-x-1/2 rounded-full bg-ink shadow-float ring-2 ring-surface transition-[left] duration-700"
          style={{ left: `${(markerIndex / (TICKS - 1)) * 100}%` }}
        />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-ink-faint">{over ? "Over by" : "Available this month"}</p>
          <p className={`font-tabular text-xl font-extrabold tracking-tight ${over ? "text-negative" : "text-positive"}`}>
            {formatMoney(Math.abs(available), currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-ink-faint">Spending limit</p>
          <p className="font-tabular text-xl font-extrabold tracking-tight text-ink">{formatMoney(limit, currency)}</p>
        </div>
      </div>
    </Card>
  );
}
