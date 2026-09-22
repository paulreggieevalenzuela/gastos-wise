import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accounts, transactions } from "@/lib/db/schema";
import { calculateAccountBalance } from "@/lib/domain/balance";
import { fromCents, toCents } from "@/lib/domain/money";
import type { DomainTransaction } from "@/lib/domain/types";
import { ConflictError, NotFoundError } from "@/lib/api/handler";
import type { CreateAccountInput, UpdateAccountInput } from "@/lib/validation/account";
import { createId } from "@/lib/db/cuid";

function toDomainTransaction(tx: typeof transactions.$inferSelect): DomainTransaction {
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

export interface AccountWithBalance {
  id: string;
  name: string;
  type: (typeof accounts.$inferSelect)["type"];
  currency: string;
  initialBalance: number;
  balance: number;
  isActive: boolean;
  sortOrder: number;
}

export async function listAccounts(userId: string, includeInactive = false): Promise<AccountWithBalance[]> {
  const [accountRows, txRows] = await Promise.all([
    db.query.accounts.findMany({
      where: (a, { eq: eqOp }) => eqOp(a.userId, userId),
      orderBy: (a, { asc }) => [asc(a.sortOrder), asc(a.createdAt)],
    }),
    db.query.transactions.findMany({ where: (t, { eq: eqOp }) => eqOp(t.userId, userId) }),
  ]);

  const domainTx = txRows.map(toDomainTransaction);

  return accountRows
    .filter((a) => includeInactive || a.isActive)
    .map((a) => {
      const balanceCents = calculateAccountBalance(
        { id: a.id, initialBalanceCents: toCents(a.initialBalance) },
        domainTx,
      );
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        currency: a.currency,
        initialBalance: Number(a.initialBalance),
        balance: fromCents(balanceCents),
        isActive: a.isActive,
        sortOrder: a.sortOrder,
      };
    });
}

export async function getAccount(userId: string, id: string): Promise<AccountWithBalance> {
  const all = await listAccounts(userId, true);
  const account = all.find((a) => a.id === id);
  if (!account) throw new NotFoundError("Account not found");
  return account;
}

export async function createAccount(userId: string, input: CreateAccountInput) {
  const [account] = await db
    .insert(accounts)
    .values({
      id: createId(),
      userId,
      name: input.name,
      type: input.type,
      currency: input.currency,
      initialBalance: input.initialBalance.toFixed(2),
    })
    .returning();
  return account;
}

export async function updateAccount(userId: string, id: string, input: UpdateAccountInput) {
  const existing = await db.query.accounts.findFirst({
    where: (a, { eq: eqOp, and: andOp }) => andOp(eqOp(a.id, id), eqOp(a.userId, userId)),
  });
  if (!existing) throw new NotFoundError("Account not found");

  const [updated] = await db
    .update(accounts)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.initialBalance !== undefined ? { initialBalance: input.initialBalance.toFixed(2) } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .returning();
  return updated;
}

/** Hard-deletes an account, or throws ConflictError if transactions reference it (archive instead). */
export async function deleteAccount(userId: string, id: string) {
  const existing = await db.query.accounts.findFirst({
    where: (a, { eq: eqOp, and: andOp }) => andOp(eqOp(a.id, id), eqOp(a.userId, userId)),
  });
  if (!existing) throw new NotFoundError("Account not found");

  const referencing = await db.query.transactions.findFirst({
    where: (t, { eq: eqOp, or: orOp }) => orOp(eqOp(t.accountId, id), eqOp(t.transferAccountId, id)),
  });
  if (referencing) {
    throw new ConflictError(
      "This account has transactions on it. Archive it instead of deleting it.",
    );
  }

  await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
}
