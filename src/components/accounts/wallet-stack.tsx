"use client";

import { useState } from "react";
import { Archive, ArchiveRestore, Nfc, Pencil, Trash2 } from "lucide-react";
import { InstitutionIcon } from "@/components/accounts/institution-icon";
import { Button } from "@/components/ui/button";
import { getInstitution } from "@/lib/institutions";
import { cn, formatMoney } from "@/lib/utils";
import type { ApiAccount } from "@/types/api";

const CARD_HEIGHT = 196; // px, matches h-[196px]
const PEEK = 66; // how much of each stacked card stays visible

function cardBackground(account: ApiAccount) {
  const inst = getInstitution(account.icon);
  return inst
    ? { backgroundImage: `linear-gradient(140deg, ${inst.color}, color-mix(in srgb, ${inst.color} 55%, black))` }
    : undefined;
}

/** A full-size wallet card. The top strip (icon, name, balance) is what shows when stacked. */
export function WalletCard({ account, raised = false }: { account: ApiAccount; raised?: boolean }) {
  const inst = getInstitution(account.icon);
  return (
    <div
      className={cn(
        "gw-shine relative flex h-[196px] flex-col justify-between overflow-hidden rounded-3xl p-4 text-white transition-shadow duration-500",
        !inst && "bg-gradient-to-br from-accent to-accent-strong text-accent-ink",
        raised ? "shadow-float" : "shadow-[0_-6px_18px_-10px_rgb(0_0_0/0.45)]",
      )}
      style={cardBackground(account)}
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border-[22px] border-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <InstitutionIcon icon={account.icon} type={account.type} size={34} className="ring-2 ring-white/30" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold">{account.name}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
            {account.type.replace("_", " ").toLowerCase()}
          </p>
        </div>
        <p className="font-tabular shrink-0 text-lg font-extrabold tracking-tight">
          {formatMoney(account.balance, account.currency)}
        </p>
      </div>

      <div className="relative flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner ring-1 ring-black/10"
          />
          <Nfc size={18} className="opacity-70" aria-hidden />
        </div>
        {!account.isActive ? (
          <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-bold">Archived</span>
        ) : (
          <p className="text-[11px] font-semibold opacity-75">
            Started at {formatMoney(account.initialBalance, account.currency)}
          </p>
        )}
      </div>
    </div>
  );
}

function Actions({
  account,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  account: ApiAccount;
  onEdit: (a: ApiAccount) => void;
  onToggleActive: (a: ApiAccount) => void;
  onDelete: (a: ApiAccount) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="ghost" onClick={() => onEdit(account)}>
        <Pencil size={14} /> Edit
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onToggleActive(account)}>
        {account.isActive ? <Archive size={14} /> : <ArchiveRestore size={14} />}
        {account.isActive ? "Archive" : "Restore"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="ml-auto text-negative hover:bg-negative-soft hover:text-negative"
        onClick={() => onDelete(account)}
        aria-label={`Delete ${account.name}`}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}

/**
 * Phones: Apple-Wallet-style stack — every card's top strip is visible,
 * tap one to pull it out (and show its actions), tap again to put it back.
 * Larger screens: a regular grid.
 */
export function WalletStack({
  accounts,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  accounts: ApiAccount[];
  onEdit: (a: ApiAccount) => void;
  onToggleActive: (a: ApiAccount) => void;
  onDelete: (a: ApiAccount) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openIndex = accounts.findIndex((a) => a.id === openId);

  return (
    <>
      {/* Phone: stacked */}
      <div className="sm:hidden" style={{ paddingBottom: 8 }}>
        {accounts.map((account, i) => {
          const isOpen = i === openIndex;
          const afterOpen = openIndex !== -1 && i === openIndex + 1;
          const marginTop = i === 0 ? 0 : afterOpen ? 12 : -(CARD_HEIGHT - PEEK);
          return (
            <div
              key={account.id}
              className={cn("relative", !account.isActive && "opacity-60")}
              style={{
                marginTop,
                zIndex: i + 1,
                transition: "margin-top 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                transform: isOpen ? "translateY(-4px)" : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : account.id)}
                aria-expanded={isOpen}
                aria-label={`${account.name}, ${formatMoney(account.balance, account.currency)}. ${isOpen ? "Close" : "Open"} card`}
                className="block w-full text-left"
              >
                <WalletCard account={account} raised={isOpen} />
              </button>
              {isOpen && (
                <div className="gw-fade mt-2 rounded-2xl border border-border bg-surface px-2 py-1.5 shadow-card">
                  <Actions account={account} onEdit={onEdit} onToggleActive={onToggleActive} onDelete={onDelete} />
                </div>
              )}
            </div>
          );
        })}
        {accounts.length > 1 && openIndex === -1 && (
          <p className="mt-4 text-center text-xs font-semibold text-ink-faint">Tap a card to open it</p>
        )}
      </div>

      {/* Tablet / desktop: grid */}
      <div className="gw-stagger hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account, index) => (
          <div key={account.id} style={{ ["--i" as string]: index }} className={!account.isActive ? "opacity-60" : undefined}>
            <div className="transition-transform duration-300 hover:-translate-y-1">
              <WalletCard account={account} raised />
            </div>
            <div className="mt-2 px-1">
              <Actions account={account} onEdit={onEdit} onToggleActive={onToggleActive} onDelete={onDelete} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
