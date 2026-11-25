"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, HelpCircle, LogOut, Palette, Settings, Tags, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AccentPicker } from "@/components/theme/accent-picker";
import { cn, initials } from "@/lib/utils";

function saveSettings(body: Record<string, string>) {
  fetch("/api/v1/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

export function AvatarMenu({ name, email }: { name: string; email?: string }) {
  const [open, setOpen] = useState(false);
  const [themeExpanded, setThemeExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
      setThemeExpanded(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
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
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        title={name}
        className={cn(
          "gw-press flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong text-sm font-bold text-accent-ink shadow-glow ring-offset-2 ring-offset-bg transition-shadow",
          open && "ring-2 ring-accent",
        )}
      >
        {initials(name)}
      </button>

      {open && (
        <div
          role="menu"
          className="gw-pop absolute right-0 top-12 z-50 max-h-[calc(100dvh-5rem)] w-[19rem] max-w-[calc(100vw-2rem)] origin-top-right overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface p-2 shadow-float"
        >
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
              {initials(name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{name}</p>
              {email && <p className="truncate text-xs text-ink-faint">{email}</p>}
            </div>
          </div>
          <div className="my-1 h-px bg-border" />

          <Link href="/settings#profile" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <UserIcon size={17} />
            Profile
          </Link>

          <button
            type="button"
            role="menuitem"
            className={cn(itemClass, themeExpanded && "bg-surface-raised text-ink")}
            onClick={() => setThemeExpanded((v) => !v)}
            aria-expanded={themeExpanded}
          >
            <Palette size={17} />
            <span className="flex-1">Theme</span>
            <ChevronDown size={16} className={cn("transition-transform", themeExpanded && "rotate-180")} />
          </button>
          {themeExpanded && (
            <div className="gw-fade mx-1 mb-1 mt-1 space-y-3 rounded-xl border border-border bg-bg/60 p-3">
              <ThemeToggle onChange={(mode) => saveSettings({ themeMode: mode })} />
              <AccentPicker onChange={(hex) => saveSettings({ accentColor: hex })} />
            </div>
          )}

          <Link href="/categories" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <Tags size={17} />
            Categories
          </Link>
          <Link href="/settings" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <Settings size={17} />
            Settings
          </Link>
          <Link href="/faq" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <HelpCircle size={17} />
            Help &amp; FAQ
          </Link>

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className={cn(itemClass, "text-negative hover:bg-negative-soft hover:text-negative")}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
