import { Home, PieChart, Plus, Smartphone, Utensils, Wallet, Zap, type LucideIcon } from "lucide-react";
import { getInstitution } from "@/lib/institutions";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/landing/count-up";

interface DemoTransaction {
  icon: LucideIcon;
  name: string;
  meta: string;
  amount: string;
  positive: boolean;
}

const TRANSACTIONS: DemoTransaction[] = [
  { icon: Zap, name: "Meralco", meta: "Bills · GCash", amount: "−₱2,340.00", positive: false },
  { icon: Utensils, name: "Jollibee", meta: "Food · Cash", amount: "−₱289.00", positive: false },
  { icon: Wallet, name: "Salary", meta: "Income · BDO", amount: "+₱25,000.00", positive: true },
  { icon: Smartphone, name: "Mobile data", meta: "Bills · Maya", amount: "−₱299.00", positive: false },
];

// Sums to the ₱48,250 total balance shown above them.
const ACCOUNT_CHIPS = [
  { key: "gcash", amount: "₱3,200" },
  { key: "bdo", amount: "₱42,550" },
  { key: "cash", amount: "₱2,500" },
];

const FLOATING = [
  { key: "maya", className: "-left-14 top-28", delay: 0 },
  { key: "bpi", className: "-right-12 top-56", delay: 1.6 },
  { key: "unionbank", className: "-left-12 bottom-6", delay: 3.2 },
];

function InstitutionDot({ instKey, size = 20 }: { instKey: string; size?: number }) {
  const inst = getInstitution(instKey);
  if (!inst) return null;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: inst.color, fontSize: size * 0.38 }}
    >
      {inst.badge}
    </span>
  );
}

/**
 * A purely decorative, CSS-animated phone showing what GastosWise looks like
 * in use: balance counting up, a budget bar filling, and transactions
 * sliding in. All motion is disabled under prefers-reduced-motion.
 */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[272px] sm:w-[292px]" aria-hidden>
      {FLOATING.map(({ key, className, delay }) => {
        const inst = getInstitution(key);
        if (!inst) return null;
        return (
          <div
            key={key}
            className={cn("lp-fade-up absolute z-10 hidden sm:block", className)}
            style={{ animationDelay: `${1.4 + delay / 4}s` }}
          >
            <div
              className="lp-float flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-3.5 text-xs font-medium text-ink shadow-lg"
              style={{ animationDelay: `${delay}s` }}
            >
              <InstitutionDot instKey={key} size={24} />
              {inst.label.replace(" (PayMaya)", "")}
            </div>
          </div>
        );
      })}

      <div className="lp-fade-up rounded-[2.75rem] bg-[#0f1512] p-2.5 shadow-2xl ring-1 ring-black/10 dark:bg-[#2b3832] dark:ring-white/10" style={{ animationDelay: "200ms" }}>
        <div className="relative overflow-hidden rounded-[2.25rem] bg-bg">
          <div className="absolute left-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

          <div className="space-y-3.5 px-4 pb-4 pt-11">
            {/* Balance */}
            <div className="lp-fade-up" style={{ animationDelay: "500ms" }}>
              <p className="text-[11px] text-ink-faint">Total balance</p>
              <p className="font-display text-[26px] leading-tight text-ink">
                <CountUp value={48250} delayMs={600} />
              </p>
            </div>

            {/* Accounts */}
            <div className="lp-fade-up flex gap-1.5" style={{ animationDelay: "700ms" }}>
              {ACCOUNT_CHIPS.map(({ key, amount }) => (
                <div key={key} className="flex flex-1 items-center gap-1.5 rounded-xl bg-surface px-2 py-1.5 shadow-card">
                  <InstitutionDot instKey={key} size={18} />
                  <span className="font-tabular text-[10px] font-medium text-ink">{amount}</span>
                </div>
              ))}
            </div>

            {/* Budget */}
            <div className="lp-fade-up rounded-2xl bg-surface p-3 shadow-card" style={{ animationDelay: "850ms" }}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-ink">Food budget</span>
                <span className="font-tabular text-ink-muted">₱6,800 / ₱10,000</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-raised">
                <div className="lp-grow-x h-full w-[68%] rounded-full bg-accent" style={{ animationDelay: "1000ms" }} />
              </div>
              <p className="mt-1.5 text-[10px] text-ink-faint">68% used · 6 days left</p>
            </div>

            {/* Transactions */}
            <div>
              <p className="lp-fade-up mb-1.5 text-[11px] font-medium text-ink-muted" style={{ animationDelay: "1100ms" }}>
                Recent
              </p>
              <ul className="space-y-1.5">
                {TRANSACTIONS.map(({ icon: Icon, name, meta, amount, positive }, i) => (
                  <li
                    key={name}
                    className="lp-slide-in flex items-center gap-2.5 rounded-xl bg-surface px-2.5 py-2 shadow-card"
                    style={{ animationDelay: `${1250 + i * 180}ms` }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Icon size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium text-ink">{name}</span>
                      <span className="block truncate text-[9.5px] text-ink-faint">{meta}</span>
                    </span>
                    <span
                      className={cn(
                        "font-tabular text-[11px] font-medium",
                        positive ? "text-positive" : "text-ink",
                      )}
                    >
                      {amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center justify-around border-t border-border bg-surface px-6 pb-4 pt-2 text-ink-faint">
            <Home size={16} className="text-accent" />
            <span className="-mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg">
              <Plus size={20} />
            </span>
            <PieChart size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
