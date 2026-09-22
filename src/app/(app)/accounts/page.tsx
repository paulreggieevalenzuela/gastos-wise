"use client";

import { useState } from "react";
import { useAccounts, useDeleteAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { AccountForm } from "@/components/accounts/account-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ACCOUNT_TYPE_ICONS } from "@/lib/icons";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Accounts</h1>
        <Button onClick={() => setModalOpen(true)}>Add account</Button>
      </div>

      {actionError && (
        <p className="rounded-md bg-negative-soft px-3 py-2 text-sm text-negative">{actionError}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState
          title="No accounts yet"
          description="Add your first account — cash, a bank, an e-wallet — to start tracking balances."
          action={<Button onClick={() => setModalOpen(true)}>Add account</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = ACCOUNT_TYPE_ICONS[account.type];
            return (
              <Card key={account.id} className={!account.isActive ? "opacity-60" : undefined}>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{account.name}</p>
                        <p className="text-xs capitalize text-ink-muted">
                          {account.type.toLowerCase().replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    {!account.isActive && <Badge tone="neutral">Archived</Badge>}
                  </div>
                  <p className="font-tabular font-display text-xl text-ink">
                    {formatMoney(account.balance, account.currency)}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(account)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => toggleActive(account)}>
                      {account.isActive ? "Archive" : "Restore"}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-negative" onClick={() => remove(account)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add account">
        <AccountForm onDone={() => setModalOpen(false)} />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit account">
        {editing && <AccountForm account={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
