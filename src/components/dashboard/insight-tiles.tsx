import { CalendarDays, Receipt, TrendingDown, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { getCategoryIcon } from "@/lib/icons";
import { cn, formatMoney } from "@/lib/utils";

function Tile({
  label,
  icon: Icon,
  children,
  hint,
  index,
}: {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  hint?: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className="rounded-2xl border border-border/80 bg-surface p-4 shadow-card"
      style={{ ["--i" as string]: index }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-ink">{label}</p>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-raised text-ink-muted">
          <Icon size={14} />
        </span>
      </div>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-0.5 truncate text-[11px] font-medium text-ink-faint">{hint}</p>}
    </div>
  );
}

export function InsightTiles({
  weekly,
  lastPurchase,
  net,
  dayBudget,
  daysLeft,
  currency,
}: {
  weekly: { spent: number; changePct: number | null };
  lastPurchase: {
    amount: string;
    merchant: string | null;
    description: string | null;
    category: { name: string; icon: string | null } | null;
  } | null;
  net: number;
  dayBudget: number | null;
  daysLeft: number;
  currency: string;
}) {
  const up = (weekly.changePct ?? 0) > 0;
  const LastIcon = getCategoryIcon(lastPurchase?.category?.icon, lastPurchase?.category?.name);

  return (
    <div className="gw-stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label="Weekly trend" icon={up ? TrendingUp : TrendingDown} index={0} hint={`${formatMoney(weekly.spent, currency)} spent in 7 days`}>
        {weekly.changePct === null ? (
          <p className="text-xl font-extrabold text-ink-muted">—</p>
        ) : (
          <p className={cn("font-tabular text-xl font-extrabold", up ? "text-negative" : "text-positive")}>
            {up ? "+" : ""}
            {weekly.changePct}%
          </p>
        )}
      </Tile>

      <Tile
        label="Last purchase"
        icon={Receipt}
        index={1}
        hint={
          lastPurchase ? (
            <span className="inline-flex items-center gap-1">
              <LastIcon size={11} />
              {lastPurchase.merchant || lastPurchase.description || lastPurchase.category?.name || "Expense"}
            </span>
          ) : (
            "Nothing yet"
          )
        }
      >
        <p className="font-tabular text-xl font-extrabold text-warning">
          {lastPurchase ? `−${formatMoney(Number(lastPurchase.amount), currency)}` : "—"}
        </p>
      </Tile>

      <Tile label="Net this month" icon={Wallet} index={2} hint={net >= 0 ? "You're saving" : "Spending more than you earn"}>
        <p className={cn("font-tabular text-xl font-extrabold", net >= 0 ? "text-positive" : "text-negative")}>
          {net >= 0 ? "+" : ""}
          {formatMoney(net, currency)}
        </p>
      </Tile>

      <Tile label="Day budget" icon={CalendarDays} index={3} hint={`${daysLeft} ${daysLeft === 1 ? "day" : "days"} left this month`}>
        <p className="font-tabular text-xl font-extrabold text-accent">
          {dayBudget === null ? "—" : formatMoney(dayBudget, currency)}
        </p>
      </Tile>
    </div>
  );
}
