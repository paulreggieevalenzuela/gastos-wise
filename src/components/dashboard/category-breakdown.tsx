import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategoryColorClasses } from "@/lib/category-colors";
import { getCategoryIcon } from "@/lib/icons";
import { formatMoney } from "@/lib/utils";

interface BreakdownItem {
  categoryId: string;
  category: { name: string; color: string | null; icon: string | null } | null;
  total: number;
}

export function CategoryBreakdown({ items, currency }: { items: BreakdownItem[]; currency: string }) {
  const total = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Where it went</CardTitle>
        <span className="text-xs font-semibold text-ink-faint">This month</span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={PieChart} title="No expenses yet" description="Add an expense to see the breakdown here." />
        ) : (
          <ul className="gw-stagger space-y-3.5">
            {items.slice(0, 6).map((item, index) => {
              const colors = getCategoryColorClasses(item.category?.color);
              const Icon = getCategoryIcon(item.category?.icon, item.category?.name);
              const pct = total > 0 ? Math.round((item.total / total) * 100) : 0;
              return (
                <li key={item.categoryId} className="flex items-center gap-3" style={{ ["--i" as string]: index }}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-semibold text-ink">{item.category?.name ?? "Uncategorized"}</span>
                      <span className="font-tabular shrink-0 font-bold text-ink">{formatMoney(item.total, currency)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
                        <div className={`lp-grow-x h-full rounded-full ${colors.dot}`} style={{ width: `${Math.max(3, pct)}%` }} />
                      </div>
                      <span className="w-8 text-right text-[11px] font-semibold text-ink-faint">{pct}%</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
