"use client";

import { useState } from "react";
import { useCreateAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Picker } from "@/components/ui/picker";
import { IconTile } from "@/components/ui/icon-tile";
import { ACCOUNT_TYPE_ICONS } from "@/lib/icons";
import { InstitutionIcon } from "@/components/accounts/institution-icon";
import { INSTITUTIONS, getInstitution } from "@/lib/institutions";
import type { ApiAccount, AccountType } from "@/types/api";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK", label: "Bank" },
  { value: "EWALLET", label: "E-wallet" },
  { value: "SAVINGS", label: "Savings" },
  { value: "CREDIT_CARD", label: "Credit card" },
  { value: "OTHER", label: "Other" },
];

const TYPE_LABEL: Record<AccountType, string> = {
  CASH: "Cash",
  BANK: "Bank",
  EWALLET: "E-wallet",
  SAVINGS: "Savings",
  CREDIT_CARD: "Credit card",
  OTHER: "Other",
};

export function AccountForm({ account, onDone }: { account?: ApiAccount; onDone: () => void }) {
  const isEdit = Boolean(account);
  const [institutionKey, setInstitutionKey] = useState<string>(account?.icon ?? "custom");
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<AccountType>(account?.type ?? "CASH");
  const [initialBalance, setInitialBalance] = useState(
    account ? String(account.initialBalance) : "0",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  function onInstitutionChange(key: string) {
    setInstitutionKey(key);
    const institution = getInstitution(key);
    if (institution) {
      setType(institution.type);
      setName((prev) => (prev.trim() === "" ? institution.label : prev));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        icon: institutionKey === "custom" ? null : institutionKey,
        initialBalance: Number(initialBalance) || 0,
      };
      if (isEdit && account) {
        await updateMutation.mutateAsync({ id: account.id, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
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
      <div>
        <Label htmlFor="institution">Institution</Label>
        <Picker
          id="institution"
          title="Bank or e-wallet"
          aria-label="Institution"
          value={institutionKey}
          onChange={onInstitutionChange}
          options={[
            {
              value: "custom",
              label: "Custom / other",
              hint: "Any account not listed",
              icon: <InstitutionIcon icon={null} type={type} size={28} />,
            },
            ...INSTITUTIONS.map((i) => ({
              value: i.key,
              label: i.label,
              hint: TYPE_LABEL[i.type] === i.label ? undefined : TYPE_LABEL[i.type],
              icon: <InstitutionIcon icon={i.key} type={i.type} size={28} />,
            })),
          ]}
        />
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Picker
          id="type"
          title="Account type"
          aria-label="Account type"
          value={type}
          onChange={(v) => setType(v as AccountType)}
          options={ACCOUNT_TYPES.map((t) => ({
            value: t.value,
            label: t.label,
            icon: <IconTile icon={ACCOUNT_TYPE_ICONS[t.value]} />,
          }))}
        />
      </div>
      <div>
        <Label htmlFor="initialBalance">
          {isEdit ? "Initial balance" : "Starting balance"}
        </Label>
        <Input
          id="initialBalance"
          inputMode="decimal"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
        />
        {isEdit && (
          <p className="mt-1 text-xs text-ink-muted">
            Changing this shifts the account&apos;s current balance by the same amount.
          </p>
        )}
      </div>
      <FieldError>{error ?? undefined}</FieldError>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Add account"}
        </Button>
      </div>
    </form>
  );
}
