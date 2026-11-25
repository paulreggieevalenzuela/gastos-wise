"use client";

import { useState } from "react";
import { useAccounts, useDeleteAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { AccountForm } from "@/components/accounts/account-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { WalletMiniCard } from "@/components/accounts/wallet-mini-card";
import { Archive, ArchiveRestore, Landmark, Pencil, Plus, Trash2 } from "lucide-react";
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

  async function remove(account: ApiAccount) {
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(account.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Couldn't delete this account.");
    }
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
        <div className="gw-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account, index) => (
            <div key={account.id} style={{ ["--i" as string]: index }} className={!account.isActive ? "opacity-55" : undefined}>
              <WalletMiniCard
                name={account.name}
                type={account.type}
                icon={account.icon}
                balance={account.balance}
                currency={account.currency}
                className="transition-transform duration-300 hover:-translate-y-1"
              />
              <div className="mt-2.5 flex items-center gap-1.5 px-1">
                {!account.isActive && <Badge tone="neutral">Archived</Badge>}
                <div className="ml-auto flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(account)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(account)}>
                    {account.isActive ? <Archive size={14} /> : <ArchiveRestore size={14} />}
                    {account.isActive ? "Archive" : "Restore"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-negative hover:bg-negative-soft hover:text-negative"
                    onClick={() => remove(account)}
                    aria-label={`Delete ${account.name}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add wallet">
        <AccountForm onDone={() => setModalOpen(false)} />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit wallet">
        {editing && <AccountForm account={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
