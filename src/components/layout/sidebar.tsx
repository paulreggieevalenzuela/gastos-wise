"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Landmark,
  LayoutGrid,
  PiggyBank,
  Plus,
  Settings,
  Tags,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Wallets", icon: Landmark },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface/70 px-4 py-5 backdrop-blur md:flex">
      <Link href="/dashboard" className="px-2">
        <Logo />
      </Link>

      <Link
        href="/transactions?new=1"
        className="gw-press mt-7 flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-ink shadow-glow transition hover:brightness-110"
      >
        <Plus size={18} strokeWidth={2.5} />
        Add transaction
      </Link>

      <nav className="mt-6 flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-accent-soft text-accent" : "text-ink-muted hover:bg-surface-raised hover:text-ink",
              )}
            >
              <Icon size={18} strokeWidth={2} className="transition-transform group-hover:scale-110" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <p className="px-3 text-[11px] font-medium text-ink-faint">Your money, mapped.</p>
    </aside>
  );
}

const MOBILE_LEFT = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/transactions", label: "Activity", icon: ArrowLeftRight },
] as const;

const MOBILE_RIGHT = [
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/accounts", label: "Wallets", icon: Landmark },
] as const;

/**
 * Floating pill tab bar for phones, with a raised "add" button in the
 * middle — the action people reach for most.
 */
export function MobileNav() {
  const pathname = usePathname();

  const renderItem = (item: (typeof MOBILE_LEFT)[number] | (typeof MOBILE_RIGHT)[number]) => {
    const active = isActive(pathname, item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "gw-press flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-semibold transition-colors",
          active ? "text-accent" : "text-ink-faint",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
            active && "bg-accent-soft",
          )}
        >
          <Icon size={19} strokeWidth={active ? 2.4 : 2} />
        </span>
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="bottom-safe fixed inset-x-3 z-40 md:hidden" aria-label="Main">
      <div className="mx-auto flex max-w-md items-center rounded-[26px] border border-border bg-surface/85 px-2 py-1.5 shadow-float backdrop-blur-xl">
        {MOBILE_LEFT.map(renderItem)}
        <div className="flex flex-1 justify-center">
          <Link
            href="/transactions?new=1"
            aria-label="Add transaction"
            className="gw-press -mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong text-accent-ink shadow-glow ring-4 ring-bg"
          >
            <Plus size={26} strokeWidth={2.5} />
          </Link>
        </div>
        {MOBILE_RIGHT.map(renderItem)}
      </div>
    </nav>
  );
}
