// Client-side shapes for API responses. Decimal columns come back as
// strings (Drizzle/postgres.js do not coerce numeric to number) and dates
// come back as ISO strings once they cross a JSON response.

export type AccountType = "CASH" | "BANK" | "EWALLET" | "SAVINGS" | "CREDIT_CARD" | "OTHER";
export type CategoryType = "INCOME" | "EXPENSE";
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type BudgetPeriod = "MONTHLY" | "WEEKLY" | "YEARLY";

export interface ApiAccount {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  balance: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ApiCategory {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  parentId: string | null;
  isArchived: boolean;
  sortOrder: number;
}

export interface ApiTransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  transferAccountId: string | null;
  type: TransactionType;
  amount: string;
  currency: string;
  transactionDate: string;
  description: string | null;
  notes: string | null;
  merchant: string | null;
  account: ApiAccount | null;
  category: ApiCategory | null;
  transferAccount?: ApiAccount | null;
}

export interface ApiBudget {
  id: string;
  categoryId: string;
  category: ApiCategory | null;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string | null;
  periodStart: string;
  periodEnd: string;
  spent: number;
  remaining: number;
  usagePercent: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}
