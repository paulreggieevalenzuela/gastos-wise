import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/services/auth";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { StatTile } from "@/components/dashboard/stat-tile";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();
  const user = await getUserById(session!.userId);
  const currency = user?.currency ?? "PHP";
  const summary = await getDashboardSummary(session!.userId);

  const now = new Date();
  const monthLabel = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" }).format(now);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-faint">{monthLabel}</p>
          <h1 className="font-display text-2xl text-ink">Overview</h1>
        </div>
        <Link href="/transactions?new=1">
          <Button>Add transaction</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total balance" value={formatMoney(summary.totalBalance, currency)} />
        <StatTile label="Income" value={formatMoney(summary.income, currency)} tone="positive" />
        <StatTile label="Expenses" value={formatMoney(summary.expense, currency)} tone="negative" />
        <StatTile
          label="Net cash flow"
          value={formatMoney(summary.net, currency)}
          tone={summary.net >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Income vs. expenses</CardTitle>
            <span className="text-xs text-ink-faint">Last 6 months</span>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={summary.monthlyTrend} currency={currency} />
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <CategoryBreakdown items={summary.categoryBreakdown} currency={currency} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <Link href="/transactions" className="text-xs font-medium text-accent hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {summary.recentTransactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Record your first expense or income to get started."
              action={
                <Link href="/transactions?new=1">
                  <Button size="sm">Add transaction</Button>
                </Link>
              }
            />
          ) : (
            <div>
              {summary.recentTransactions.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
