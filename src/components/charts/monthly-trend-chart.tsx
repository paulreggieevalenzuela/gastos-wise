"use client";

import { useState } from "react";
import { cn, formatMoney } from "@/lib/utils";

interface TrendPoint {
  month: string;
  income: number;
  expense: number;
}

/** Rounds up to a tidy axis maximum: 47,300 → 50,000; 8,200 → 10,000. */
function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  for (const s of steps) {
    if (s * magnitude >= value) return s * magnitude;
  }
  return 10 * magnitude;
}

function shortAmount(v: number): string {
  if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${+(v / 1000).toFixed(v >= 10_000 ? 0 : 1)}k`;
  return String(Math.round(v));
}

/**
 * Income vs. spending bars — a lightweight replacement for a charting
 * library (saves ~100 kB on the dashboard). Bars grow in one after another,
 * and tapping a month shows its numbers in the summary line.
 */
export function MonthlyTrendChart({ data, currency }: { data: TrendPoint[]; currency: string }) {
  const [selected, setSelected] = useState(Math.max(0, data.length - 1));
  const max = niceMax(Math.max(...data.map((d) => Math.max(d.income, d.expense)), 0));
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const point = data[selected];

  return (
    <div>
      {point && (
        <div key={selected} className="gw-fade mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-sm font-bold text-ink">{point.month}</p>
          <p className="text-xs font-semibold text-ink-muted">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent align-middle" />
            Income <span className="font-tabular font-bold text-ink">{formatMoney(point.income, currency)}</span>
          </p>
          <p className="text-xs font-semibold text-ink-muted">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-negative align-middle" />
            Spent <span className="font-tabular font-bold text-ink">{formatMoney(point.expense, currency)}</span>
          </p>
          <p
            className={cn(
              "font-tabular text-xs font-bold",
              point.income - point.expense >= 0 ? "text-positive" : "text-negative",
            )}
          >
            {point.income - point.expense >= 0 ? "+" : "−"}
            {formatMoney(Math.abs(point.income - point.expense), currency)} net
          </p>
        </div>
      )}

      <div className="relative h-52 pl-9">
        {/* gridlines + axis labels */}
        {ticks.map((t) => (
          <div
            key={t}
            className="pointer-events-none absolute left-9 right-0 border-t border-dashed border-border"
            style={{ bottom: `${t * 100}%` }}
          >
            <span className="font-tabular absolute -left-9 -top-2 w-8 text-right text-[10px] font-semibold text-ink-faint">
              {shortAmount(max * t)}
            </span>
          </div>
        ))}

        <div className="relative flex h-full items-end gap-1 sm:gap-2" role="group" aria-label="Income and spending by month">
          {data.map((d, i) => {
            const active = i === selected;
            return (
              <button
                key={d.month}
                type="button"
                onClick={() => setSelected(i)}
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                aria-pressed={active}
                aria-label={`${d.month}: income ${formatMoney(d.income, currency)}, spent ${formatMoney(d.expense, currency)}`}
                className={cn(
                  "group relative flex h-full flex-1 items-end justify-center gap-1 rounded-xl pb-0 transition-colors",
                  active ? "bg-accent-soft/60" : "hover:bg-surface-raised/60",
                )}
              >
                <span
                  className="gw-grow-y w-2.5 rounded-full bg-accent transition-opacity sm:w-3.5"
                  style={{
                    height: `${Math.max(1.5, (d.income / max) * 100)}%`,
                    animationDelay: `${i * 80}ms`,
                    opacity: active ? 1 : 0.55,
                  }}
                />
                <span
                  className="gw-grow-y w-2.5 rounded-full bg-negative transition-opacity sm:w-3.5"
                  style={{
                    height: `${Math.max(1.5, (d.expense / max) * 100)}%`,
                    animationDelay: `${i * 80 + 40}ms`,
                    opacity: active ? 0.9 : 0.4,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex gap-1 pl-9 sm:gap-2">
        {data.map((d, i) => (
          <span
            key={d.month}
            className={cn(
              "flex-1 text-center text-[11px] font-bold",
              i === selected ? "text-ink" : "text-ink-faint",
            )}
          >
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
}
