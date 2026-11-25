"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, LogOut, Palette, Settings, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AccentPicker } from "@/components/theme/accent-picker";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function AvatarMenu({ name, email }: { name: string; email?: string }) {
  const [open, setOpen] = useState(false);
  const [themeExpanded, setThemeExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setThemeExpanded(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setThemeExpanded(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent ring-offset-2 ring-offset-surface transition-shadow hover:ring-2 hover:ring-border-strong"
        title={name}
      >
        {initials(name)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 rounded-lg border border-border bg-surface p-1.5 shadow-card"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            {email && <p className="truncate text-xs text-ink-faint">{email}</p>}
          </div>
          <div className="my-1 h-px bg-border" />

          <Link href="/settings#profile" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <UserIcon size={16} strokeWidth={2} />
            Profile
          </Link>

          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => setThemeExpanded((v) => !v)}
            aria-expanded={themeExpanded}
          >
            <Palette size={16} strokeWidth={2} />
            Theme
          </button>
          {themeExpanded && (
            <div className="mb-1 space-y-3 rounded-md bg-surface-raised px-3 py-3">
              <ThemeToggle />
              <AccentPicker
                onChange={(hex) => {
                  fetch("/api/v1/settings", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accentColor: hex }),
                  }).catch(() => {});
                }}
              />
            </div>
          )}

          <Link href="/settings" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <Settings size={16} strokeWidth={2} />
            Settings
          </Link>

          <Link href="/faq" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <HelpCircle size={16} strokeWidth={2} />
            Help &amp; FAQ
          </Link>

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className={cn(itemClass, "text-negative hover:bg-negative-soft hover:text-negative")}
          >
            <LogOut size={16} strokeWidth={2} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
