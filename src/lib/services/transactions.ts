import { and, desc, eq, gte, ilike, lte, or, SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accounts, categories, transactions } from "@/lib/db/schema";
import {
  assertCategoryMatchesTransactionType,
  assertPositiveAmount,
  assertValidTransfer,
} from "@/lib/domain/rules";
import { NotFoundError } from "@/lib/api/handler";
import type { CreateTransactionInput, TransactionFilters, UpdateTransactionInput } from "@/lib/validation/transaction";
import { createId } from "@/lib/db/cuid";

async function assertOwnsAccount(userId: string, accountId: string) {
  const account = await db.query.accounts.findFirst({
    where: (a, { eq: eqOp, and: andOp }) => andOp(eqOp(a.id, accountId), eqOp(a.userId, userId)),
  });
  if (!account) throw new NotFoundError("Account not found");
  return account;
}

async function assertOwnsCategory(userId: string, categoryId: string) {
  const category = await db.query.categories.findFirst({
    where: (c, { eq: eqOp, and: andOp }) => andOp(eqOp(c.id, categoryId), eqOp(c.userId, userId)),
  });
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function listTransactions(userId: string, filters: TransactionFilters) {
  const conditions: SQL[] = [eq(transactions.userId, userId)];
  if (filters.type) conditions.push(eq(transactions.type, filters.type));
  if (filters.accountId) conditions.push(eq(transactions.accountId, filters.accountId));
  if (filters.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters.from) conditions.push(gte(transactions.transactionDate, filters.from));
  if (filters.to) conditions.push(lte(transactions.transactionDate, filters.to));
  if (filters.search) {
    const term = `%${filters.search}%`;
    const searchClause = or(ilike(transactions.description, term), ilike(transactions.merchant, term));
    if (searchClause) conditions.push(searchClause);
  }

  const where = and(...conditions);
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows, allMatching] = await Promise.all([
    db
      .select({
        transaction: transactions,
        account: accounts,
        category: categories,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(where)
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(filters.pageSize)
      .offset(offset),
    db.select({ id: transactions.id }).from(transactions).where(where),
  ]);

  return {
    items: rows.map((r) => ({
      ...r.transaction,
      account: r.account,
      category: r.category,
    })),
    total: allMatching.length,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getTransaction(userId: string, id: string) {
  const row = await db.query.transactions.findFirst({
    where: (t, { eq: eqOp, and: andOp }) => andOp(eqOp(t.id, id), eqOp(t.userId, userId)),
    with: { account: true, category: true, transferAccount: true },
  });
  if (!row) throw new NotFoundError("Transaction not found");
  return row;
}

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  assertPositiveAmount(Math.round(input.amount * 100));

  const account = await assertOwnsAccount(userId, input.accountId);

  if (input.type === "TRANSFER") {
    assertValidTransfer(input.accountId, input.transferAccountId);
    await assertOwnsAccount(userId, input.transferAccountId);
  } else {
    const category = await assertOwnsCategory(userId, input.categoryId);
    assertCategoryMatchesTransactionType(input.type, category.type);
  }

  const [transaction] = await db
    .insert(transactions)
    .values({
      id: createId(),
      userId,
      accountId: input.accountId,
      categoryId: input.type === "TRANSFER" ? null : input.categoryId,
      transferAccountId: input.type === "TRANSFER" ? input.transferAccountId : null,
      type: input.type,
      amount: input.amount.toFixed(2),
      currency: input.currency ?? account.currency,
      transactionDate: input.transactionDate,
      description: input.description ?? null,
      notes: input.notes ?? null,
      merchant: input.merchant ?? null,
    })
    .returning();
  return transaction;
}

export async function updateTransaction(userId: string, id: string, input: UpdateTransactionInput) {
  const existing = await db.query.transactions.findFirst({
    where: (t, { eq: eqOp, and: andOp }) => andOp(eqOp(t.id, id), eqOp(t.userId, userId)),
  });
  if (!existing) throw new NotFoundError("Transaction not found");

  const nextAccountId = input.accountId ?? existing.accountId;
  if (input.accountId) await assertOwnsAccount(userId, input.accountId);

  if (existing.type === "TRANSFER") {
    const nextTransferAccountId = input.transferAccountId ?? existing.transferAccountId!;
    assertValidTransfer(nextAccountId, nextTransferAccountId);
    if (input.transferAccountId) await assertOwnsAccount(userId, input.transferAccountId);
  } else if (input.categoryId) {
    const category = await assertOwnsCategory(userId, input.categoryId);
    assertCategoryMatchesTransactionType(existing.type, category.type);
  }

  if (input.amount !== undefined) {
    assertPositiveAmount(Math.round(input.amount * 100));
  }

  const [updated] = await db
    .update(transactions)
    .set({
      ...(input.accountId !== undefined ? { accountId: input.accountId } : {}),
      ...(input.categoryId !== undefined && existing.type !== "TRANSFER"
        ? { categoryId: input.categoryId }
        : {}),
      ...(input.transferAccountId !== undefined && existing.type === "TRANSFER"
        ? { transferAccountId: input.transferAccountId }
        : {}),
      ...(input.amount !== undefined ? { amount: input.amount.toFixed(2) } : {}),
      ...(input.transactionDate !== undefined ? { transactionDate: input.transactionDate } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.merchant !== undefined ? { merchant: input.merchant } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();
  return updated;
}

export async function deleteTransaction(userId: string, id: string) {
  const existing = await db.query.transactions.findFirst({
    where: (t, { eq: eqOp, and: andOp }) => andOp(eqOp(t.id, id), eqOp(t.userId, userId)),
  });
  if (!existing) throw new NotFoundError("Transaction not found");
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}
