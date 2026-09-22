import { describe, expect, it } from "vitest";
import { calculateBudgetUsage } from "./budget";

describe("calculateBudgetUsage", () => {
  it("computes remaining and usage percent under budget", () => {
    const usage = calculateBudgetUsage(12_000_00, 7_250_00);
    expect(usage.remainingCents).toBe(4_750_00);
    expect(usage.usagePercent).toBe(60);
    expect(usage.isOverBudget).toBe(false);
    expect(usage.isNearLimit).toBe(false);
  });

  it("flags near-limit at 80% or more without being over", () => {
    const usage = calculateBudgetUsage(10_000_00, 8_500_00);
    expect(usage.isNearLimit).toBe(true);
    expect(usage.isOverBudget).toBe(false);
  });

  it("flags over-budget once spend exceeds the budget", () => {
    const usage = calculateBudgetUsage(10_000_00, 10_500_00);
    expect(usage.isOverBudget).toBe(true);
    expect(usage.remainingCents).toBe(-500_00);
  });

  it("treats a zero budget as fully used without dividing by zero", () => {
    const usage = calculateBudgetUsage(0, 500);
    expect(usage.usagePercent).toBe(0);
    expect(usage.isOverBudget).toBe(true);
  });
});
