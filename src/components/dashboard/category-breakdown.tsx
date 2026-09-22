import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategoryColorClasses } from "@/lib/category-colors";
import { formatMoney } from "@/lib/utils";

interface BreakdownItem {
  categoryId: string;
  category: { name: string; color: string | null; icon: string | null } | null;
  total: number;
}

export function CategoryBreakdown({ items, currency }: { items: BreakdownItem[]; currency: string }) {
  const max = Math.max(1, ...items.map((i) => i.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by category</CardTitle>
        <span className="text-xs text-ink-faint">This month</span>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title="No expenses yet this month" description="Add an expense to see the breakdown here." />
        ) : (
          <ul className="space-y-3">
            {items.slice(0, 8).map((item) => {
              const colors = getCategoryColorClasses(item.category?.color);
              const widthPct = Math.max(4, Math.round((item.total / max) * 100));
              return (
                <li key={item.categoryId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink">
                      <span className={`h-2 w-2 rounded-full ${colors.dot}`} aria-hidden="true" />
                      {item.category?.name ?? "Uncategorized"}
                    </span>
                    <span className="font-tabular text-ink-muted">{formatMoney(item.total, currency)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-raised">
                    <div
                      className={`h-1.5 rounded-full ${colors.dot}`}
                      style={{ width: `${widthPct}%` }}
                    />
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
