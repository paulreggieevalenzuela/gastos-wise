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
import { PiggyBank, Plus } from "lucide-react";
import type { ApiBudget } from "@/types/api";

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useBudgets();
  const deleteMutation = useDeleteBudget();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiBudget | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-accent">Plan</p>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Budgets</h1>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Add budget
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : !budgets || budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets yet"
          description="Set a monthly limit for a category to track how close you are to it."
          action={<Button onClick={() => setModalOpen(true)}>Add budget</Button>}
        />
      ) : (
        <div className="gw-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget, index) => {
            const colors = getCategoryColorClasses(budget.category?.color);
            const Icon = getCategoryIcon(budget.category?.icon, budget.category?.name);
            const barColor = budget.isOverBudget
              ? "bg-negative"
              : budget.isNearLimit
                ? "bg-warning"
                : colors.dot;
            return (
              <Card key={budget.id} style={{ ["--i" as string]: index }}>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}>
                        <Icon size={19} />
                      </div>
                      <div>
                        <p className="font-bold text-ink">{budget.category?.name}</p>
                        <p className="text-xs font-semibold text-ink-faint">{Math.round(budget.usagePercent)}% used</p>
                      </div>
                    </div>
                    {budget.isOverBudget && <Badge tone="negative">Over budget</Badge>}
                    {!budget.isOverBudget && budget.isNearLimit && <Badge tone="warning">Near limit</Badge>}
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                      <span className="font-tabular text-lg font-extrabold text-ink">{formatMoney(budget.spent, "PHP")}</span>
                      <span className="font-tabular text-ink-muted">
                        of {formatMoney(budget.amount, "PHP")}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-raised">
                      <div
                        className={cn("lp-grow-x h-full rounded-full", barColor)}
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
