"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/use-categories";
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budgets";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import type { ApiBudget, BudgetPeriod } from "@/types/api";

export function BudgetForm({ budget, onDone }: { budget?: ApiBudget; onDone: () => void }) {
  const isEdit = Boolean(budget);
  const { data: categories } = useCategories();
  const expenseCategories = (categories ?? []).filter((c) => c.type === "EXPENSE");

  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? expenseCategories[0]?.id ?? "");
  const [amount, setAmount] = useState(budget ? String(budget.amount) : "");
  const [period, setPeriod] = useState<BudgetPeriod>(budget?.period ?? "MONTHLY");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amountNumber = Number(amount);
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }
    if (!amountNumber || amountNumber <= 0) {
      setError("Enter a budget amount greater than zero.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && budget) {
        await updateMutation.mutateAsync({
          id: budget.id,
          input: { amount: amountNumber, period },
        });
      } else {
        await createMutation.mutateAsync({
          categoryId,
          amount: amountNumber,
          period,
          startDate: new Date().toISOString(),
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isEdit}
          required
        >
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parentId ? `— ${c.name}` : c.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Budget amount</Label>
          <Input
            id="amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="period">Period</Label>
          <Select id="period" value={period} onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}>
            <option value="MONTHLY">Monthly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="YEARLY">Yearly</option>
          </Select>
        </div>
      </div>
      <FieldError>{error ?? undefined}</FieldError>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Add budget"}
        </Button>
      </div>
    </form>
  );
}
