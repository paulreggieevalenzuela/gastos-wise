"use client";

import { useState } from "react";
import { useBudgets, useDeleteBudget } from "@/hooks/use-budgets";
import { BudgetForm } from "@/components/budgets/budget-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategoryColorClasses } from "@/lib/category-colors";
import { getCategoryIcon } from "@/lib/icons";
import { cn, formatMoney } from "@/lib/utils";
import type { ApiBudget } from "@/types/api";

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useBudgets();
  const deleteMutation = useDeleteBudget();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiBudget | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Budgets</h1>
        <Button onClick={() => setModalOpen(true)}>Add budget</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : !budgets || budgets.length === 0 ? (
        <EmptyState
          title="No budgets yet"
          description="Set a monthly limit for a category to track how close you are to it."
          action={<Button onClick={() => setModalOpen(true)}>Add budget</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const colors = getCategoryColorClasses(budget.category?.color);
            const Icon = getCategoryIcon(budget.category?.icon);
            const barColor = budget.isOverBudget
              ? "bg-negative"
              : budget.isNearLimit
                ? "bg-warning"
                : colors.dot;
            return (
              <Card key={budget.id}>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${colors.bg} ${colors.text}`}>
                        <Icon size={14} />
                      </div>
                      <span className="font-medium text-ink">{budget.category?.name}</span>
                    </div>
                    {budget.isOverBudget && <Badge tone="negative">Over budget</Badge>}
                    {!budget.isOverBudget && budget.isNearLimit && <Badge tone="warning">Near limit</Badge>}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                      <span className="font-tabular text-ink">{formatMoney(budget.spent, "PHP")}</span>
                      <span className="font-tabular text-ink-muted">
                        of {formatMoney(budget.amount, "PHP")}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-raised">
                      <div
                        className={cn("h-1.5 rounded-full", barColor)}
                        style={{ width: `${Math.min(100, budget.usagePercent)}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-ink-muted">
                      {budget.remaining >= 0
                        ? `${formatMoney(budget.remaining, "PHP")} remaining`
                        : `${formatMoney(Math.abs(budget.remaining), "PHP")} over`}
                      {" · "}
                      {budget.period.charAt(0) + budget.period.slice(1).toLowerCase()}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(budget)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-negative"
                      onClick={() => deleteMutation.mutate(budget.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add budget">
        <BudgetForm onDone={() => setModalOpen(false)} />
      </Modal>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit budget">
        {editing && <BudgetForm budget={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
