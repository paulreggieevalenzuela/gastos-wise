// Plain payload shapes for what the client sends to the API — decoupled
// from the zod schemas' *parsed* (post-coercion) types, since those force
// fields like `currency` (has a server-side default) to appear required
// and `transactionDate` to be a `Date` rather than the ISO string the
// client actually sends over JSON.
import type { AccountType, BudgetPeriod, CategoryType, TransactionType } from "@/types/api";

export interface AccountFormPayload {
  name: string;
  type: AccountType;
  initialBalance: number;
  currency?: string;
}

export interface CategoryFormPayload {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parentId?: string | null;
}

export interface CategoryUpdatePayload {
  name?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
  isArchived?: boolean;
}

interface TransactionCommonPayload {
  accountId: string;
  amount: number;
  transactionDate: string;
  description?: string | null;
  notes?: string | null;
  merchant?: string | null;
}

export type TransactionFormPayload =
  | (TransactionCommonPayload & { type: Extract<TransactionType, "EXPENSE" | "INCOME">; categoryId: string })
  | (TransactionCommonPayload & { type: "TRANSFER"; transferAccountId: string });

export type TransactionUpdatePayload = Partial<TransactionCommonPayload> & {
  categoryId?: string | null;
  transferAccountId?: string | null;
};

export interface BudgetFormPayload {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
}

export interface BudgetUpdatePayload {
  amount?: number;
  period?: BudgetPeriod;
}
