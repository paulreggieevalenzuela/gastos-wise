import { ArrowLeftRight } from "lucide-react";
import { getCategoryColorClasses } from "@/lib/category-colors";
import { getCategoryIcon } from "@/lib/icons";
import { formatMoney, formatRelativeDay } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface TransactionRowData {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: string | number;
  currency: string;
  transactionDate: string | Date;
  description?: string | null;
  merchant?: string | null;
  account?: { name: string } | null;
  transferAccount?: { name: string } | null;
  category?: { name: string; color: string | null; icon: string | null } | null;
}

export function TransactionRow({
  transaction,
  onClick,
}: {
  transaction: TransactionRowData;
  onClick?: () => void;
}) {
  const isTransfer = transaction.type === "TRANSFER";
  const Icon = isTransfer ? null : getCategoryIcon(transaction.category?.icon);
  const colors = getCategoryColorClasses(transaction.category?.color);
  const title = transaction.merchant || transaction.description || transaction.category?.name || (isTransfer ? "Transfer" : "Transaction");
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
      className={cn(
        "flex w-full items-center gap-3 border-b border-border px-1 py-3 text-left last:border-0",
        onClick && "cursor-pointer transition-colors hover:bg-surface-raised/60",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isTransfer ? "bg-surface-raised text-ink-muted" : `${colors.bg} ${colors.text}`,
        )}
      >
        {isTransfer ? <ArrowLeftRight size={16} /> : Icon && <Icon size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{title}</p>
        <p className="truncate text-xs text-ink-muted">{subtitle}</p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "font-tabular text-sm font-medium",
            signedAmount === null ? "text-ink-muted" : signedAmount > 0 ? "text-positive" : "text-negative",
          )}
        >
          {signedAmount === null
            ? formatMoney(amountValue, transaction.currency)
            : `${signedAmount > 0 ? "+" : ""}${formatMoney(signedAmount, transaction.currency)}`}
        </p>
        <p className="text-xs text-ink-faint">{formatRelativeDay(transaction.transactionDate)}</p>
      </div>
    </button>
  );
}
