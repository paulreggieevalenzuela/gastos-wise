import { InstitutionIcon } from "@/components/accounts/institution-icon";
import { getInstitution } from "@/lib/institutions";
import { cn, formatMoney } from "@/lib/utils";
import type { AccountType } from "@/types/api";

/**
 * Card-shaped account tile. Banks/e-wallets use a gradient in their brand
 * hint color; custom accounts use the user's accent.
 */
export function WalletMiniCard({
  name,
  type,
  icon,
  balance,
  currency,
  className,
}: {
  name: string;
  type: AccountType;
  icon: string | null;
  balance: number;
  currency: string;
  className?: string;
}) {
  const inst = getInstitution(icon);
  const style = inst
    ? { backgroundImage: `linear-gradient(140deg, ${inst.color}, color-mix(in srgb, ${inst.color} 55%, black))` }
    : undefined;

  return (
    <div
      className={cn(
        "gw-shine relative flex aspect-[1.6/1] flex-col justify-between overflow-hidden rounded-2xl p-4 text-white shadow-float",
        !inst && "bg-gradient-to-br from-accent to-accent-strong text-accent-ink",
        className,
      )}
      style={style}
    >
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border-[18px] border-white/10" />
      <div className="relative flex items-center justify-between">
        <InstitutionIcon icon={icon} type={type} size={30} className="ring-2 ring-white/30" />
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-75">
          {type.replace("_", " ").toLowerCase()}
        </span>
      </div>
      <div className="relative">
        <p className="truncate text-xs font-semibold opacity-85">{name}</p>
        <p className="font-tabular truncate text-lg font-extrabold tracking-tight">{formatMoney(balance, currency)}</p>
      </div>
    </div>
  );
}
