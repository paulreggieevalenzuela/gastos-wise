"use client";

import { useState } from "react";
import { PenLine, Sparkles } from "lucide-react";
import { QuickAdd } from "@/components/transactions/quick-add";
import { TransactionForm, type TransactionFormInitial } from "@/components/transactions/transaction-form";
import { cn } from "@/lib/utils";

/**
 * What the "+" button opens: Quick add (type or speak a phrase) first,
 * with the full form one tap away — prefilled from whatever was typed.
 */
export function AddTransactionPanel({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"quick" | "form">("quick");
  const [initial, setInitial] = useState<TransactionFormInitial | undefined>(undefined);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-raised p-1" role="tablist" aria-label="How to add">
        {(
          [
            { value: "quick", label: "Quick add", icon: Sparkles },
            { value: "form", label: "Full form", icon: PenLine },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(tab.value)}
              className={cn(
                "gw-press flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-colors",
                active ? "bg-surface text-ink shadow-card" : "text-ink-muted",
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {mode === "quick" ? (
        <QuickAdd
          onSaved={onDone}
          onReview={(draft) => {
            setInitial({
              type: draft.type,
              amount: draft.amount,
              accountId: draft.accountId,
              transferAccountId: draft.transferAccountId,
              categoryId: draft.categoryId,
              merchant: draft.merchant,
              daysAgo: draft.daysAgo,
            });
            setMode("form");
          }}
        />
      ) : (
        <TransactionForm key={JSON.stringify(initial ?? {})} initial={initial} onDone={onDone} />
      )}
    </div>
  );
}
