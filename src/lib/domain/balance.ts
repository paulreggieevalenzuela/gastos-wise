import { addCents } from "./money";
import type { DomainAccount, DomainTransaction } from "./types";

/**
 * The financial rules from the architecture doc, section 12:
 *
 *   EXPENSE  -> account balance decreases, expense total increases
 *   INCOME   -> account balance increases, income total increases
 *   TRANSFER -> source account decreases, destination account increases,
 *               neither income nor expense totals move
 *
 * The database (transactions + initialBalance) is the source of truth —
 * `currentBalance` on an Account row is never trusted on its own; it is
 * always derivable by replaying transactions through this function.
 */
export function applyTransactionToAccount(
  balanceCents: number,
  accountId: string,
  tx: Pick<DomainTransaction, "type" | "amountCents" | "accountId" | "transferAccountId">,
): number {
  if (tx.type === "EXPENSE" && tx.accountId === accountId) {
    return balanceCents - tx.amountCents;
  }
  if (tx.type === "INCOME" && tx.accountId === accountId) {
    return balanceCents + tx.amountCents;
  }
  if (tx.type === "TRANSFER") {
    if (tx.accountId === accountId) {
      return balanceCents - tx.amountCents;
    }
    if (tx.transferAccountId === accountId) {
      return balanceCents + tx.amountCents;
    }
  }
  return balanceCents;
}

/** Replay every transaction that touches `account` to derive its current balance. */
export function calculateAccountBalance(
  account: DomainAccount,
  transactions: DomainTransaction[],
): number {
  return transactions.reduce(
    (balance, tx) => applyTransactionToAccount(balance, account.id, tx),
    account.initialBalanceCents,
  );
}

/** Total balance across a set of accounts, each derived independently. */
export function calculateTotalBalance(
  accounts: DomainAccount[],
  transactionsByAccount: Map<string, DomainTransaction[]>,
): number {
  return addCents(
    ...accounts.map((account) =>
      calculateAccountBalance(account, transactionsByAccount.get(account.id) ?? []),
    ),
  );
}

export interface PeriodTotals {
  incomeCents: number;
  expenseCents: number;
  netCents: number;
}

/** Income/expense/net totals for a set of transactions. Transfers never contribute. */
export function calculatePeriodTotals(transactions: DomainTransaction[]): PeriodTotals {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const tx of transactions) {
    if (tx.type === "INCOME") incomeCents += tx.amountCents;
    if (tx.type === "EXPENSE") expenseCents += tx.amountCents;
  }
  return { incomeCents, expenseCents, netCents: incomeCents - expenseCents };
}

export interface CategoryTotal {
  categoryId: string;
  totalCents: number;
}

/** Expense totals grouped by category, sorted descending — used for dashboard breakdowns. */
export function calculateCategoryBreakdown(
  transactions: DomainTransaction[],
  type: "EXPENSE" | "INCOME" = "EXPENSE",
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== type || !tx.categoryId) continue;
    totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amountCents);
  }
  return Array.from(totals.entries())
    .map(([categoryId, totalCents]) => ({ categoryId, totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents);
}
