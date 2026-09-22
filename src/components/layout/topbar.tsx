"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { initials } from "@/lib/utils";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Topbar({ name }: { name: string }) {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-8">
      <div>
        <p className="text-xs text-ink-faint">{greeting()}</p>
        <p className="font-display text-lg text-ink">{name}</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
          title={name}
        >
          {initials(name)}
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sign out"
          className="rounded-md p-2 text-ink-muted hover:bg-surface-raised hover:text-ink"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
