export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

/**
 * A transaction shape reduced to exactly what the domain layer needs to
 * reason about money. Amounts are integer cents (see money.ts) so this
 * layer never touches Prisma.Decimal or floating point directly.
 */
export interface DomainTransaction {
  id: string;
  type: TransactionType;
  amountCents: number;
  accountId: string;
  /** Destination account for TRANSFER rows only. */
  transferAccountId?: string | null;
  categoryId?: string | null;
  transactionDate: Date;
}

export interface DomainAccount {
  id: string;
  initialBalanceCents: number;
}
