import { ArrowLeftRight } from "lucide-react";
import { InstitutionIcon } from "@/components/accounts/institution-icon";
import { getCategoryColorClasses } from "@/lib/category-colors";
import { getCategoryIcon } from "@/lib/icons";
import { cn, formatMoney, formatRelativeDay } from "@/lib/utils";
import type { AccountType } from "@/types/api";

export interface TransactionRowData {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: string | number;
  currency: string;
  transactionDate: string | Date;
  description?: string | null;
  merchant?: string | null;
  account?: { name: string; icon?: string | null; type?: AccountType } | null;
  transferAccount?: { name: string; icon?: string | null; type?: AccountType } | null;
  category?: { name: string; color: string | null; icon: string | null } | null;
}

export function TransactionRow({
  transaction,
  onClick,
  showDate = true,
  index = 0,
}: {
  transaction: TransactionRowData;
  onClick?: () => void;
  showDate?: boolean;
  index?: number;
}) {
  const isTransfer = transaction.type === "TRANSFER";
  const Icon = isTransfer ? ArrowLeftRight : getCategoryIcon(transaction.category?.icon, transaction.category?.name);
  const colors = getCategoryColorClasses(transaction.category?.color);
  const title =
    transaction.merchant ||
    transaction.description ||
    transaction.category?.name ||
    (isTransfer ? "Transfer" : "Transaction");
  const subtitle = isTransfer
    ? `${transaction.account?.name ?? "—"} → ${transaction.transferAccount?.name ?? "—"}`
    : `${transaction.category?.name ?? "Uncategorized"} · ${transaction.account?.name ?? "—"}`;

  const amountValue = typeof transaction.amount === "string" ? Number(transaction.amount) : transaction.amount;
  const signedAmount =
    transaction.type === "EXPENSE" ? -amountValue : transaction.type === "INCOME" ? amountValue : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{ ["--i" as string]: index }}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left disabled:cursor-default",
        onClick && "gw-press transition-colors hover:bg-surface-raised/70",
      )}
    >
      <div className="relative shrink-0">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            isTransfer ? "bg-surface-raised text-ink-muted" : `${colors.bg} ${colors.text}`,
          )}
        >
          <Icon size={19} />
        </div>
        {transaction.account && (
          <InstitutionIcon
            icon={transaction.account.icon}
            type={transaction.account.type ?? "OTHER"}
            size={18}
            className="absolute -bottom-1 -right-1 ring-2 ring-surface"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{title}</p>
        <p className="truncate text-xs font-medium text-ink-faint">{subtitle}</p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "font-tabular text-sm font-extrabold",
            signedAmount === null ? "text-ink-muted" : signedAmount > 0 ? "text-positive" : "text-ink",
          )}
        >
          {signedAmount === null
            ? formatMoney(amountValue, transaction.currency)
            : `${signedAmount > 0 ? "+" : "−"}${formatMoney(Math.abs(signedAmount), transaction.currency)}`}
        </p>
        {showDate && (
          <p className="text-[11px] font-medium text-ink-faint">{formatRelativeDay(transaction.transactionDate)}</p>
        )}
      </div>
    </button>
  );
}
