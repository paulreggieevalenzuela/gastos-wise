import { and, eq } from "drizzle-orm";
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { db } from "@/lib/db/client";
import { budgets, transactions } from "@/lib/db/schema";
import { calculateBudgetUsage } from "@/lib/domain/budget";
import { fromCents, toCents } from "@/lib/domain/money";
import { NotFoundError } from "@/lib/api/handler";
import type { CreateBudgetInput, UpdateBudgetInput } from "@/lib/validation/budget";
import { createId } from "@/lib/db/cuid";

function periodRange(period: "MONTHLY" | "WEEKLY" | "YEARLY", reference: Date) {
  switch (period) {
    case "WEEKLY":
      return { start: startOfWeek(reference), end: endOfWeek(reference) };
    case "YEARLY":
      return { start: startOfYear(reference), end: endOfYear(reference) };
    case "MONTHLY":
    default:
      return { start: startOfMonth(reference), end: endOfMonth(reference) };
  }
}

export async function listBudgetsWithUsage(userId: string, reference: Date = new Date()) {
  const rows = await db.query.budgets.findMany({
    where: (b, { eq: eqOp }) => eqOp(b.userId, userId),
    with: { category: true },
    orderBy: (b, { asc }) => [asc(b.createdAt)],
  });

  const results = await Promise.all(
    rows.map(async (budget) => {
      const { start, end } = periodRange(budget.period, reference);
      const spentRows = await db.query.transactions.findMany({
        where: (t, { eq: eqOp, and: andOp, gte: gteOp, lte: lteOp }) =>
          andOp(
            eqOp(t.userId, userId),
            eqOp(t.categoryId, budget.categoryId),
            eqOp(t.type, "EXPENSE"),
            gteOp(t.transactionDate, start),
            lteOp(t.transactionDate, end),
          ),
      });
      const spentCents = spentRows.reduce((sum, t) => sum + toCents(t.amount), 0);
      const usage = calculateBudgetUsage(toCents(budget.amount), spentCents);
      return {
        id: budget.id,
        categoryId: budget.categoryId,
        category: budget.category,
        amount: Number(budget.amount),
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
        periodStart: start,
        periodEnd: end,
        spent: fromCents(usage.spentCents),
        remaining: fromCents(usage.remainingCents),
        usagePercent: usage.usagePercent,
        isOverBudget: usage.isOverBudget,
        isNearLimit: usage.isNearLimit,
      };
    }),
  );

  return results;
}

export async function createBudget(userId: string, input: CreateBudgetInput) {
  const category = await db.query.categories.findFirst({
    where: (c, { eq: eqOp, and: andOp }) => andOp(eqOp(c.id, input.categoryId), eqOp(c.userId, userId)),
  });
  if (!category) throw new NotFoundError("Category not found");

  const [budget] = await db
    .insert(budgets)
    .values({
      id: createId(),
      userId,
      categoryId: input.categoryId,
      amount: input.amount.toFixed(2),
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
    })
    .returning();
  return budget;
}

export async function updateBudget(userId: string, id: string, input: UpdateBudgetInput) {
  const existing = await db.query.budgets.findFirst({
    where: (b, { eq: eqOp, and: andOp }) => andOp(eqOp(b.id, id), eqOp(b.userId, userId)),
  });
  if (!existing) throw new NotFoundError("Budget not found");

  const [updated] = await db
    .update(budgets)
    .set({
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.amount !== undefined ? { amount: input.amount.toFixed(2) } : {}),
      ...(input.period !== undefined ? { period: input.period } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
      ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
    .returning();
  return updated;
}

export async function deleteBudget(userId: string, id: string) {
  const existing = await db.query.budgets.findFirst({
    where: (b, { eq: eqOp, and: andOp }) => andOp(eqOp(b.id, id), eqOp(b.userId, userId)),
  });
  if (!existing) throw new NotFoundError("Budget not found");
  await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
}
