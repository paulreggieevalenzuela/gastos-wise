"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import type { ApiTransaction, TransactionType } from "@/types/api";

const TYPE_TABS: { value: TransactionType; label: string }[] = [
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
  { value: "TRANSFER", label: "Transfer" },
];

function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function TransactionForm({
  transaction,
  onDone,
}: {
  transaction?: ApiTransaction;
  onDone: () => void;
}) {
  const isEdit = Boolean(transaction);
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const [type, setType] = useState<TransactionType>(transaction?.type ?? "EXPENSE");
  const [accountId, setAccountId] = useState(transaction?.accountId ?? "");
  const [transferAccountId, setTransferAccountId] = useState(transaction?.transferAccountId ?? "");
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "");
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [date, setDate] = useState(toDateInputValue(transaction?.transactionDate ?? new Date()));
  const [merchant, setMerchant] = useState(transaction?.merchant ?? "");
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [notes, setNotes] = useState(transaction?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!accountId && accounts?.[0]) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  const relevantCategories = useMemo(
    () => (categories ?? []).filter((c) => c.type === type),
    [categories, type],
  );

  useEffect(() => {
    if (type === "TRANSFER") return;
    if (categoryId && !relevantCategories.some((c) => c.id === categoryId)) {
      setCategoryId(relevantCategories[0]?.id ?? "");
    } else if (!categoryId && relevantCategories[0]) {
      setCategoryId(relevantCategories[0].id);
    }
  }, [type, relevantCategories, categoryId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountNumber = Number(amount);
    if (!amountNumber || amountNumber <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (type === "TRANSFER" && accountId === transferAccountId) {
      setError("Choose two different accounts to transfer between.");
      return;
    }
    if (type !== "TRANSFER" && !categoryId) {
      setError("Choose a category.");
      return;
    }

    const basePayload = {
      accountId,
      amount: amountNumber,
      transactionDate: new Date(date).toISOString(),
      description: description || null,
      notes: notes || null,
      merchant: merchant || null,
    };

    setSubmitting(true);
    try {
      if (isEdit && transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          input:
            type === "TRANSFER"
              ? { ...basePayload, transferAccountId }
              : { ...basePayload, categoryId },
        });
      } else {
        await createMutation.mutateAsync(
          type === "TRANSFER"
            ? { type, ...basePayload, transferAccountId }
            : { type, ...basePayload, categoryId },
        );
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
      {!isEdit && (
        <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-surface-raised p-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setType(tab.value)}
              className={`rounded-[5px] py-1.5 text-sm font-medium transition-colors ${
                type === tab.value ? "bg-surface text-ink shadow-card" : "text-ink-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="account">{type === "TRANSFER" ? "From account" : "Account"}</Label>
          <Select id="account" value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
            {accounts?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        {type === "TRANSFER" ? (
          <div>
            <Label htmlFor="transferAccount">To account</Label>
            <Select
              id="transferAccount"
              value={transferAccountId}
              onChange={(e) => setTransferAccountId(e.target.value)}
              required
            >
              <option value="">Select account</option>
              {accounts
                ?.filter((a) => a.id !== accountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </Select>
          </div>
        ) : (
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {relevantCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentId ? `— ${c.name}` : c.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="merchant">Merchant</Label>
          <Input
            id="merchant"
            placeholder="e.g. Jollibee"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : `Save ${type.toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
}
