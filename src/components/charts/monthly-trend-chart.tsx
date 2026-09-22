"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCssColor } from "@/lib/use-css-color";
import { formatMoney } from "@/lib/utils";

interface TrendPoint {
  month: string;
  income: number;
  expense: number;
}

function CustomTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-card">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center justify-between gap-4 text-ink-muted">
          <span className="capitalize">{p.dataKey}</span>
          <span className="font-tabular text-ink">{formatMoney(p.value, currency)}</span>
        </p>
      ))}
    </div>
  );
}

export function MonthlyTrendChart({ data, currency }: { data: TrendPoint[]; currency: string }) {
  const positive = useCssColor("--color-positive", "rgb(31 111 84)");
  const negative = useCssColor("--color-negative", "rgb(179 69 59)");
  const gridColor = useCssColor("--color-border", "rgb(226 224 216)");
  const inkMuted = useCssColor("--color-ink-muted", "rgb(75 90 84)");

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: inkMuted, fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: inkMuted, fontSize: 12 }}
            width={48}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: gridColor, opacity: 0.4 }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: inkMuted }}
          />
          <Bar dataKey="income" name="Income" fill={positive} radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="expense" name="Expense" fill={negative} radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
