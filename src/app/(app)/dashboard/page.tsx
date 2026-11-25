import Link from "next/link";
import { ArrowRight, Receipt } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/services/auth";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { applyStarterDataSafely } from "@/lib/services/onboarding";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { SpendingMeter } from "@/components/dashboard/spending-meter";
import { InsightTiles } from "@/components/dashboard/insight-tiles";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { WalletMiniCard } from "@/components/accounts/wallet-mini-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline">
      {children}
      <ArrowRight size={13} />
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  const user = await getUserById(session!.userId);
  // Same once-only step as the app layout; awaited here too so the very first
  // dashboard render already includes the starter wallet and categories.
  if (user && !user.starterDataAppliedAt) await applyStarterDataSafely(user.id);
  const currency = user?.currency ?? "PHP";
  const summary = await getDashboardSummary(session!.userId);

  const monthLabel = new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" }).format(new Date());

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-accent">{monthLabel}</p>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Your money this month</h1>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <WalletCard
            total={summary.totalBalance}
            income={summary.income}
            expense={summary.expense}
            currency={currency}
            accountCount={summary.accounts.length}
          />
        </div>
        <div className="lg:col-span-3">
          <SpendingMeter
            spent={summary.spending.spent}
            limit={summary.spending.limit}
            available={summary.spending.available}
            limitSource={summary.spending.limitSource}
            currency={currency}
          />
        </div>
      </div>

      <InsightTiles
        weekly={summary.weekly}
        lastPurchase={summary.lastPurchase}
        net={summary.net}
        dayBudget={summary.spending.dayBudget}
        daysLeft={summary.spending.daysLeft}
        currency={currency}
      />

      {summary.accounts.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-ink">Wallets</h2>
            <SectionLink href="/accounts">Manage</SectionLink>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:scroll-px-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
            {summary.accounts.map((account) => (
              <WalletMiniCard
                key={account.id}
                name={account.name}
                type={account.type}
                icon={account.icon}
                balance={account.balance}
                currency={account.currency}
                className="w-[70%] shrink-0 snap-start sm:w-[45%] md:w-auto"
              />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Income vs. spending</CardTitle>
            <span className="text-xs font-semibold text-ink-faint">Last 6 months</span>
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
          <SectionLink href="/transactions">View all</SectionLink>
        </CardHeader>
        <CardContent className="px-3 pt-3 sm:px-4">
          {summary.recentTransactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Record your first expense or income to get started."
              action={
                <Link href="/transactions?new=1">
                  <Button size="sm">Add transaction</Button>
                </Link>
              }
            />
          ) : (
            <div className="gw-stagger">
              {summary.recentTransactions.map((t, i) => (
                <TransactionRow key={t.id} transaction={t} index={i} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
