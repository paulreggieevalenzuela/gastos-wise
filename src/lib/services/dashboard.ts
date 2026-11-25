import { differenceInCalendarDays, endOfMonth, format, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import { db } from "@/lib/db/client";
import { listAccounts } from "@/lib/services/accounts";
import { listBudgetsWithUsage } from "@/lib/services/budgets";
import {
  calculateCategoryBreakdown,
  calculatePeriodTotals,
} from "@/lib/domain/balance";
import { fromCents, toCents } from "@/lib/domain/money";
import type { DomainTransaction } from "@/lib/domain/types";

function toDomainTransaction(tx: {
  id: string;
  type: DomainTransaction["type"];
  amount: string;
  accountId: string;
  transferAccountId: string | null;
  categoryId: string | null;
  transactionDate: Date;
}): DomainTransaction {
  return {
    id: tx.id,
    type: tx.type,
    amountCents: toCents(tx.amount),
    accountId: tx.accountId,
    transferAccountId: tx.transferAccountId,
    categoryId: tx.categoryId,
    transactionDate: tx.transactionDate,
  };
}

export async function getDashboardSummary(userId: string, reference: Date = new Date()) {
  const monthStart = startOfMonth(reference);
  const monthEnd = endOfMonth(reference);

  const [accounts, allTransactions, categoryRows, budgets] = await Promise.all([
    listAccounts(userId),
    db.query.transactions.findMany({
      where: (t, { eq }) => eq(t.userId, userId),
      orderBy: (t, { desc }) => [desc(t.transactionDate), desc(t.createdAt)],
    }),
    db.query.categories.findMany({ where: (c, { eq }) => eq(c.userId, userId) }),
    listBudgetsWithUsage(userId, reference),
  ]);

  const categoryById = new Map(categoryRows.map((c) => [c.id, c]));
  const domainTx = allTransactions.map(toDomainTransaction);
  const thisMonthTx = domainTx.filter(
    (t) => t.transactionDate >= monthStart && t.transactionDate <= monthEnd,
  );

  const totalBalance = fromCents(accounts.reduce((sum, a) => sum + Math.round(a.balance * 100), 0));
  const monthTotals = calculatePeriodTotals(thisMonthTx);
  const categoryBreakdown = calculateCategoryBreakdown(thisMonthTx, "EXPENSE").map((c) => ({
    categoryId: c.categoryId,
    category: categoryById.get(c.categoryId) ?? null,
    total: fromCents(c.totalCents),
  }));

  const recentTransactions = allTransactions.slice(0, 8).map((t) => ({
    ...t,
    account: accounts.find((a) => a.id === t.accountId) ?? null,
    category: t.categoryId ? categoryById.get(t.categoryId) ?? null : null,
  }));

  const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
    const monthDate = subMonths(reference, 5 - i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const monthTx = domainTx.filter((t) => t.transactionDate >= start && t.transactionDate <= end);
    const totals = calculatePeriodTotals(monthTx);
    return {
      month: format(monthDate, "MMM"),
      income: fromCents(totals.incomeCents),
      expense: fromCents(totals.expenseCents),
    };
  });

  // Spending meter: measured against the month's budgets if any are set,
  // otherwise against this month's income.
  const monthlyBudgetTotal = budgets
    .filter((b) => b.period === "MONTHLY")
    .reduce((sum, b) => sum + b.amount, 0);
  const monthIncome = fromCents(monthTotals.incomeCents);
  const monthExpense = fromCents(monthTotals.expenseCents);
  const spendingLimit = monthlyBudgetTotal > 0 ? monthlyBudgetTotal : monthIncome > 0 ? monthIncome : null;
  const limitSource: "budgets" | "income" | null =
    monthlyBudgetTotal > 0 ? "budgets" : monthIncome > 0 ? "income" : null;
  const available = spendingLimit === null ? null : spendingLimit - monthExpense;
  const daysLeft = differenceInCalendarDays(monthEnd, startOfDay(reference)) + 1;
  const dayBudget = available === null ? null : Math.max(0, available) / Math.max(1, daysLeft);

  // Weekly trend: last 7 days of spending vs the 7 days before.
  const today = startOfDay(reference);
  const weekStart = subDays(today, 6);
  const prevWeekStart = subDays(today, 13);
  const sumExpenses = (from: Date, to: Date) =>
    domainTx
      .filter((t) => t.type === "EXPENSE" && t.transactionDate >= from && t.transactionDate < to)
      .reduce((sum, t) => sum + t.amountCents, 0);
  const thisWeekCents = sumExpenses(weekStart, subDays(today, -1));
  const prevWeekCents = sumExpenses(prevWeekStart, weekStart);
  const weeklyChangePct =
    prevWeekCents > 0 ? Math.round(((thisWeekCents - prevWeekCents) / prevWeekCents) * 100) : null;

  const lastExpenseRow = allTransactions.find((t) => t.type === "EXPENSE");
  const lastPurchase = lastExpenseRow
    ? {
        ...lastExpenseRow,
        account: accounts.find((a) => a.id === lastExpenseRow.accountId) ?? null,
        category: lastExpenseRow.categoryId ? categoryById.get(lastExpenseRow.categoryId) ?? null : null,
      }
    : null;

  return {
    spending: {
      limit: spendingLimit,
      limitSource,
      spent: monthExpense,
      available,
      daysLeft,
      dayBudget,
    },
    weekly: {
      spent: fromCents(thisWeekCents),
      changePct: weeklyChangePct,
    },
    lastPurchase,
    totalBalance,
    accounts,
    income: fromCents(monthTotals.incomeCents),
    expense: fromCents(monthTotals.expenseCents),
    net: fromCents(monthTotals.netCents),
    categoryBreakdown,
    recentTransactions,
    monthlyTrend,
  };
}
