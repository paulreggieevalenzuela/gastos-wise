"use client";

import { useState } from "react";
import { useAccounts, useDeleteAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { AccountForm } from "@/components/accounts/account-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { WalletStack } from "@/components/accounts/wallet-stack";
import { ConfirmDialog, type ConfirmRequest } from "@/components/ui/confirm-dialog";
import { Landmark, Plus } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { ApiAccount } from "@/types/api";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts(true);
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiAccount | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggleActive(account: ApiAccount) {
    await updateMutation.mutateAsync({ id: account.id, input: { isActive: !account.isActive } });
  }

  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  function remove(account: ApiAccount) {
    setActionError(null);
    setConfirm({
      title: `Delete the \u201c${account.name}\u201d wallet?`,
      description:
        "This can\u2019t be undone. Wallets that already have transactions can\u2019t be deleted \u2014 archive them instead to hide them and keep your history.",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(account.id);
      },
      fallback: account.isActive
        ? {
            label: "Archive instead",
            onClick: async () => {
              await updateMutation.mutateAsync({ id: account.id, input: { isActive: false } });
            },
          }
        : undefined,
    });
  }

  const active = (accounts ?? []).filter((a) => a.isActive);
  const total = active.reduce((sum, a) => sum + a.balance, 0);
  const currency = active[0]?.currency ?? "PHP";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-accent">Wallets</p>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
            <span className="font-tabular">{formatMoney(total, currency)}</span>
          </h1>
          <p className="text-xs font-medium text-ink-faint">
            Across {active.length} active {active.length === 1 ? "wallet" : "wallets"}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Add wallet
        </Button>
      </div>

      {actionError && (
        <p className="gw-fade rounded-xl bg-negative-soft px-3 py-2 text-sm font-medium text-negative">{actionError}</p>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[1.6/1] animate-pulse rounded-2xl bg-surface-raised" />
          ))}
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No wallets yet"
          description="Add your first account — cash, GCash, a bank — to start tracking balances."
          action={<Button onClick={() => setModalOpen(true)}>Add wallet</Button>}
        />
      ) : (
        <WalletStack accounts={accounts} onEdit={setEditing} onToggleActive={toggleActive} onDelete={remove} />
      )}

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add wallet">
        <AccountForm onDone={() => setModalOpen(false)} />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit wallet">
        {editing && <AccountForm account={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
