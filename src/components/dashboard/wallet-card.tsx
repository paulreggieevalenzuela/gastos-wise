import { ArrowDownLeft, ArrowUpRight, Nfc } from "lucide-react";
import { CountUp } from "@/components/landing/count-up";
import { formatMoney } from "@/lib/utils";

/**
 * The hero "wallet card": total balance across every account, styled like
 * a physical card in the user's accent color.
 */
export function WalletCard({
  total,
  income,
  expense,
  currency,
  accountCount,
}: {
  total: number;
  income: number;
  expense: number;
  currency: string;
  accountCount: number;
}) {
  return (
    <div className="gw-shine relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent to-accent-strong p-5 text-accent-ink shadow-glow sm:p-6">
      {/* decorative rings */}
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[28px] border-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold opacity-80">Total balance</p>
          <p className="mt-1 text-[32px] font-extrabold leading-tight tracking-tight sm:text-4xl">
            <CountUp value={total} currency={currency} durationMs={1100} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner ring-1 ring-black/10"
          />
          <Nfc size={20} className="opacity-70" aria-hidden />
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-black/10 px-3 py-2.5 backdrop-blur-sm">
          <p className="flex items-center gap-1 text-[11px] font-semibold opacity-80">
            <ArrowDownLeft size={13} /> Income
          </p>
          <p className="font-tabular mt-0.5 text-sm font-bold">{formatMoney(income, currency)}</p>
        </div>
        <div className="rounded-2xl bg-black/10 px-3 py-2.5 backdrop-blur-sm">
          <p className="flex items-center gap-1 text-[11px] font-semibold opacity-80">
            <ArrowUpRight size={13} /> Spent
          </p>
          <p className="font-tabular mt-0.5 text-sm font-bold">{formatMoney(expense, currency)}</p>
        </div>
      </div>

      <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
        {accountCount} {accountCount === 1 ? "wallet" : "wallets"} · this month
      </p>
    </div>
  );
}
