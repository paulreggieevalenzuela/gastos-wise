"use client";

import { AvatarMenu } from "@/components/layout/avatar-menu";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Topbar({ name, email }: { name: string; email?: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-8">
      <div>
        <p className="text-xs text-ink-faint">{greeting()}</p>
        <p className="font-display text-lg text-ink">{name}</p>
      </div>
      <AvatarMenu name={name} email={email} />
    </header>
  );
}
