import { describe, expect, it } from "vitest";
import {
  applyTransactionToAccount,
  calculateAccountBalance,
  calculateCategoryBreakdown,
  calculatePeriodTotals,
  calculateTotalBalance,
} from "./balance";
import type { DomainTransaction } from "./types";

function tx(overrides: Partial<DomainTransaction>): DomainTransaction {
  return {
    id: overrides.id ?? "tx1",
    type: overrides.type ?? "EXPENSE",
    amountCents: overrides.amountCents ?? 1000,
    accountId: overrides.accountId ?? "acc1",
    transferAccountId: overrides.transferAccountId ?? null,
    categoryId: overrides.categoryId ?? null,
    transactionDate: overrides.transactionDate ?? new Date("2026-09-01"),
  };
}

describe("applyTransactionToAccount", () => {
  it("decreases balance for an expense on the account", () => {
    expect(
      applyTransactionToAccount(10000, "acc1", tx({ type: "EXPENSE", amountCents: 3500, accountId: "acc1" })),
    ).toBe(6500);
  });

  it("increases balance for income on the account", () => {
    expect(
      applyTransactionToAccount(10000, "acc1", tx({ type: "INCOME", amountCents: 3500, accountId: "acc1" })),
    ).toBe(13500);
  });

  it("ignores transactions on a different account", () => {
    expect(
      applyTransactionToAccount(10000, "acc1", tx({ type: "EXPENSE", amountCents: 3500, accountId: "acc2" })),
    ).toBe(10000);
  });

  it("decreases the source account and increases the destination account on transfer", () => {
    const t = tx({ type: "TRANSFER", amountCents: 100000, accountId: "gcash", transferAccountId: "bpi" });
    expect(applyTransactionToAccount(50000, "gcash", t)).toBe(-50000);
    expect(applyTransactionToAccount(50000, "bpi", t)).toBe(150000);
  });

  it("does not touch an unrelated account during a transfer", () => {
    const t = tx({ type: "TRANSFER", amountCents: 100000, accountId: "gcash", transferAccountId: "bpi" });
    expect(applyTransactionToAccount(20000, "cash", t)).toBe(20000);
  });
});

describe("calculateAccountBalance", () => {
  it("replays a mix of income, expense and transfer to derive the balance", () => {
    const transactions: DomainTransaction[] = [
      tx({ type: "INCOME", amountCents: 8_000_00, accountId: "bpi" }),
      tx({ type: "EXPENSE", amountCents: 1_200_00, accountId: "bpi" }),
      tx({ type: "TRANSFER", amountCents: 1_000_00, accountId: "bpi", transferAccountId: "gcash" }),
    ];
    const balance = calculateAccountBalance({ id: "bpi", initialBalanceCents: 0 }, transactions);
    expect(balance).toBe(8_000_00 - 1_200_00 - 1_000_00);
  });

  it("a transfer never inflates income or expense totals (roadmap section 8)", () => {
    const transactions: DomainTransaction[] = [
      tx({ type: "TRANSFER", amountCents: 1_000_00, accountId: "gcash", transferAccountId: "bpi" }),
    ];
    const totals = calculatePeriodTotals(transactions);
    expect(totals.incomeCents).toBe(0);
    expect(totals.expenseCents).toBe(0);
  });
});

describe("calculateTotalBalance", () => {
  it("sums independently-derived balances across accounts", () => {
    const accounts = [
      { id: "a", initialBalanceCents: 1000 },
      { id: "b", initialBalanceCents: 2000 },
    ];
    const byAccount = new Map<string, DomainTransaction[]>([
      ["a", [tx({ type: "EXPENSE", amountCents: 500, accountId: "a" })]],
      ["b", [tx({ type: "INCOME", amountCents: 500, accountId: "b" })]],
    ]);
    expect(calculateTotalBalance(accounts, byAccount)).toBe(500 + 2500);
  });
});

describe("calculatePeriodTotals", () => {
  it("sums income and expense separately and computes net", () => {
    const transactions: DomainTransaction[] = [
      tx({ type: "INCOME", amountCents: 5000 }),
      tx({ type: "EXPENSE", amountCents: 2000 }),
      tx({ type: "EXPENSE", amountCents: 500 }),
    ];
    expect(calculatePeriodTotals(transactions)).toEqual({
      incomeCents: 5000,
      expenseCents: 2500,
      netCents: 2500,
    });
  });
});

describe("calculateCategoryBreakdown", () => {
  it("groups expenses by category and sorts descending", () => {
    const transactions: DomainTransaction[] = [
      tx({ type: "EXPENSE", amountCents: 1200, categoryId: "food" }),
      tx({ type: "EXPENSE", amountCents: 8200, categoryId: "bills" }),
      tx({ type: "EXPENSE", amountCents: 300, categoryId: "food" }),
      tx({ type: "INCOME", amountCents: 80000, categoryId: "salary" }),
    ];
    expect(calculateCategoryBreakdown(transactions, "EXPENSE")).toEqual([
      { categoryId: "bills", totalCents: 8200 },
      { categoryId: "food", totalCents: 1500 },
    ]);
  });
});
