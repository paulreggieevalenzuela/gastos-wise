"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useDeleteTransaction, useTransactions } from "@/hooks/use-transactions";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import type { ApiTransaction } from "@/types/api";
import { Plus, Receipt } from "lucide-react";
import { cn, formatMoney, formatRelativeDay } from "@/lib/utils";

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "EXPENSE", label: "Expenses" },
  { value: "INCOME", label: "Income" },
  { value: "TRANSFER", label: "Transfers" },
] as const;

function TransactionsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [type, setType] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1");
  const [editing, setEditing] = useState<ApiTransaction | null>(null);

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data, isLoading } = useTransactions({ type, accountId, categoryId, page, pageSize: 20 });
  const deleteMutation = useDeleteTransaction();

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    if (searchParams.get("new")) router.replace("/transactions");
  }

  const filterOptions = useMemo(
    () => ({
      accounts: accounts ?? [],
      categories: categories ?? [],
    }),
    [accounts, categories],
  );

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: ApiTransaction[]; spent: number }>();
    for (const t of data?.items ?? []) {
      const label = formatRelativeDay(t.transactionDate);
      const group = map.get(label) ?? { label, items: [], spent: 0 };
      group.items.push(t);
      if (t.type === "EXPENSE") group.spent += Number(t.amount);
      map.set(label, group);
    }
    return Array.from(map.values());
  }, [data]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-accent">Activity</p>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Transactions</h1>
        </div>
        <Button onClick={() => setModalOpen(true)} className="hidden sm:inline-flex">
          <Plus size={18} /> Add transaction
        </Button>
      </div>

      <div className="space-y-2.5">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setType(f.value);
                setPage(1);
              }}
              className={cn(
                "gw-press shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-colors",
                type === f.value
                  ? "border-transparent bg-ink text-bg"
                  : "border-border bg-surface text-ink-muted hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setPage(1);
            }}
            className="sm:w-56"
            aria-label="Filter by wallet"
          >
            <option value="">All wallets</option>
            {filterOptions.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="sm:w-56"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {filterOptions.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-raised" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="Try a different filter, or add your first transaction."
          action={<Button onClick={() => setModalOpen(true)}>Add transaction</Button>}
        />
      ) : (
        <Card className="divide-y divide-border/70">
          {groups.map((group) => (
            <section key={group.label} className="px-3 py-3 sm:px-4">
              <div className="flex items-center justify-between px-2 pb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">{group.label}</p>
                {group.spent > 0 && (
                  <p className="font-tabular text-[11px] font-bold text-ink-faint">
                    −{formatMoney(group.spent, group.items[0]?.currency ?? "PHP")}
                  </p>
                )}
              </div>
              <div className="gw-stagger">
                {group.items.map((t, i) => (
                  <TransactionRow key={t.id} transaction={t} index={i} showDate={false} onClick={() => setEditing(t)} />
                ))}
              </div>
            </section>
          ))}
        </Card>
      )}

      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between text-sm font-medium text-ink-muted">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title="Add transaction">
        {modalOpen && <TransactionForm onDone={closeModal} />}
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit transaction">
        {editing && (
          <div className="space-y-4">
            <TransactionForm transaction={editing} onDone={() => setEditing(null)} />
            <button
              type="button"
              className="gw-press w-full rounded-xl border border-negative/30 py-2.5 text-sm font-bold text-negative hover:bg-negative-soft"
              onClick={async () => {
                if (!editing) return;
                await deleteMutation.mutateAsync(editing.id);
                setEditing(null);
              }}
            >
              Delete transaction
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsPageInner />
    </Suspense>
  );
}
