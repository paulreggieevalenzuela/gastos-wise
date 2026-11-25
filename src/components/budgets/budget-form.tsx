"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/use-categories";
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budgets";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Picker } from "@/components/ui/picker";
import { IconTile } from "@/components/ui/icon-tile";
import { CategoryBadge } from "@/components/categories/category-badge";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";
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
        <Picker
          id="category"
          title="Budget for"
          aria-label="Category"
          value={categoryId}
          onChange={setCategoryId}
          disabled={isEdit}
          placeholder="Choose a category"
          options={expenseCategories.map((c) => ({
            value: c.id,
            label: c.name,
            indent: Boolean(c.parentId),
            icon: <CategoryBadge icon={c.icon} name={c.name} color={c.color} />,
          }))}
        />
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
          <Picker
            id="period"
            title="Period"
            aria-label="Period"
            value={period}
            onChange={(v) => setPeriod(v as BudgetPeriod)}
            options={[
              { value: "WEEKLY", label: "Weekly", icon: <IconTile icon={CalendarDays} size={26} /> },
              { value: "MONTHLY", label: "Monthly", icon: <IconTile icon={Calendar} size={26} /> },
              { value: "YEARLY", label: "Yearly", icon: <IconTile icon={CalendarRange} size={26} /> },
            ]}
          />
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
