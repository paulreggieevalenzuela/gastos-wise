"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useDeleteTransaction, useTransactions } from "@/hooks/use-transactions";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import type { ApiTransaction } from "@/types/api";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Transactions</h1>
        <Button onClick={() => setModalOpen(true)}>Add transaction</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="w-auto"
        >
          <option value="">All types</option>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
          <option value="TRANSFER">Transfer</option>
        </Select>
        <Select
          value={accountId}
          onChange={(e) => {
            setAccountId(e.target.value);
            setPage(1);
          }}
          className="w-auto"
        >
          <option value="">All accounts</option>
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
          className="w-auto"
        >
          <option value="">All categories</option>
          {filterOptions.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-5">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-ink-muted">Loading…</p>
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Try a different filter, or add your first transaction."
              action={<Button onClick={() => setModalOpen(true)}>Add transaction</Button>}
            />
          ) : (
            <div>
              {data.items.map((t) => (
                <TransactionRow key={t.id} transaction={t} onClick={() => setEditing(t)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.total > data.pageSize && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
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
              className="w-full rounded-md border border-negative/30 py-2 text-sm font-medium text-negative hover:bg-negative-soft"
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
