import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { db } from "@/lib/db/client";
import { listAccounts } from "@/lib/services/accounts";
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

  const [accounts, allTransactions, categoryRows] = await Promise.all([
    listAccounts(userId),
    db.query.transactions.findMany({
      where: (t, { eq }) => eq(t.userId, userId),
      orderBy: (t, { desc }) => [desc(t.transactionDate), desc(t.createdAt)],
    }),
    db.query.categories.findMany({ where: (c, { eq }) => eq(c.userId, userId) }),
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

  return {
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
