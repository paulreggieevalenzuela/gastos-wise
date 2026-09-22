export interface BudgetUsage {
  budgetCents: number;
  spentCents: number;
  remainingCents: number;
  usagePercent: number;
  isOverBudget: boolean;
  /** True once 80% or more of the budget has been used, but not yet over. */
  isNearLimit: boolean;
}

/** Budget progress for a single category over a period. Spent is always >= 0. */
export function calculateBudgetUsage(budgetCents: number, spentCents: number): BudgetUsage {
  const spent = Math.max(0, spentCents);
  const remainingCents = budgetCents - spent;
  const usagePercent = budgetCents > 0 ? Math.round((spent / budgetCents) * 100) : 0;
  return {
    budgetCents,
    spentCents: spent,
    remainingCents,
    usagePercent,
    isOverBudget: spent > budgetCents,
    isNearLimit: usagePercent >= 80 && spent <= budgetCents,
  };
}
