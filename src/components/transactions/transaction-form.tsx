"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { InstitutionIcon } from "@/components/accounts/institution-icon";
import { getCategoryColorClasses } from "@/lib/category-colors";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ApiAccount, ApiTransaction, TransactionType } from "@/types/api";

const TYPE_TABS: { value: TransactionType; label: string }[] = [
  { value: "EXPENSE", label: "Expense" },
  { value: "INCOME", label: "Income" },
  { value: "TRANSFER", label: "Transfer" },
];

/** YYYY-MM-DD in the person's own timezone (toISOString would use UTC — yesterday, before 8am in PH). */
function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export interface TransactionFormInitial {
  type?: TransactionType;
  accountId?: string | null;
  transferAccountId?: string | null;
  categoryId?: string | null;
  amount?: number | null;
  merchant?: string | null;
  daysAgo?: number;
}

function AccountPicker({
  accounts,
  value,
  onChange,
  exclude,
  label,
}: {
  accounts: ApiAccount[];
  value: string;
  onChange: (id: string) => void;
  exclude?: string;
  label: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1" role="radiogroup" aria-label={label}>
        {accounts
          .filter((a) => a.id !== exclude)
          .map((a) => {
            const selected = value === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(a.id)}
                className={cn(
                  "gw-press flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-colors",
                  selected
                    ? "border-accent bg-accent-soft text-ink ring-2 ring-accent/20"
                    : "border-border bg-surface text-ink-muted hover:text-ink",
                )}
              >
                <InstitutionIcon icon={a.icon} type={a.type} size={26} />
                {a.name}
              </button>
            );
          })}
      </div>
    </div>
  );
}

export function TransactionForm({
  transaction,
  initial,
  onDone,
}: {
  transaction?: ApiTransaction;
  /** Prefill for a new transaction (e.g. from Quick add). */
  initial?: TransactionFormInitial;
  onDone: () => void;
}) {
  const isEdit = Boolean(transaction);
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const [type, setType] = useState<TransactionType>(transaction?.type ?? initial?.type ?? "EXPENSE");
  const [accountId, setAccountId] = useState(transaction?.accountId ?? initial?.accountId ?? "");
  const [transferAccountId, setTransferAccountId] = useState(
    transaction?.transferAccountId ?? initial?.transferAccountId ?? "",
  );
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? initial?.categoryId ?? "");
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : initial?.amount != null ? String(initial.amount) : "",
  );
  const [date, setDate] = useState(
    toDateInputValue(
      transaction?.transactionDate ?? new Date(Date.now() - (initial?.daysAgo ?? 0) * 86_400_000),
    ),
  );
  const [merchant, setMerchant] = useState(transaction?.merchant ?? initial?.merchant ?? "");
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
    <form onSubmit={onSubmit} className="space-y-5">
      {!isEdit && (
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-raised p-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setType(tab.value)}
              className={cn(
                "gw-press rounded-lg py-2 text-sm font-bold transition-colors",
                type === tab.value ? "bg-surface text-ink shadow-card" : "text-ink-muted",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-surface-raised/70 px-4 py-4 text-center">
        <Label htmlFor="amount" className="mb-1 text-center">
          Amount
        </Label>
        <div className="flex items-center justify-center gap-1">
          <span className="text-2xl font-extrabold text-ink-faint">₱</span>
          <input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            required
            autoFocus={!isEdit}
            className="font-tabular w-full max-w-[12rem] bg-transparent text-center text-4xl font-extrabold tracking-tight text-ink placeholder:text-ink-faint/60 focus:outline-none"
          />
        </div>
      </div>

      <AccountPicker
        accounts={accounts ?? []}
        label={type === "TRANSFER" ? "From wallet" : "Wallet"}
        value={accountId}
        onChange={setAccountId}
      />

      {type === "TRANSFER" ? (
        <AccountPicker
          accounts={accounts ?? []}
          label="To wallet"
          value={transferAccountId}
          onChange={setTransferAccountId}
          exclude={accountId}
        />
      ) : (
        <div>
          <Label>Category</Label>
          <div
            className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto pr-0.5 sm:grid-cols-5"
            role="radiogroup"
            aria-label="Category"
          >
            {relevantCategories.map((c) => {
              const Icon = getCategoryIcon(c.icon, c.name);
              const colors = getCategoryColorClasses(c.color);
              const selected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    "gw-press flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5 text-center transition-colors",
                    selected ? "border-accent bg-accent-soft ring-2 ring-accent/20" : "border-border bg-surface hover:border-border-strong",
                  )}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
                    <Icon size={17} />
                  </span>
                  <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-ink">{c.name}</span>
                </button>
              );
            })}
          </div>
          {relevantCategories.length === 0 && (
            <p className="text-sm text-ink-muted">No {type.toLowerCase()} categories yet — add one under Categories.</p>
          )}
        </div>
      )}

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

      <details className="group rounded-2xl border border-border px-4 py-3" open={Boolean(description || notes)}>
        <summary className="cursor-pointer list-none text-sm font-bold text-ink-muted marker:hidden">
          <span className="group-open:hidden">+ Add description or notes</span>
          <span className="hidden group-open:inline">Description &amp; notes</span>
        </summary>
        <div className="mt-3 space-y-3">
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
        </div>
      </details>

      <FieldError>{error ?? undefined}</FieldError>

      <div className="grid grid-cols-2 gap-2 pt-1">
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
