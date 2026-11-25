"use client";

import { useEffect, useState } from "react";
import { AvatarMenu } from "@/components/layout/avatar-menu";
import { Logo } from "@/components/layout/logo";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Topbar({ name, email }: { name: string; email?: string }) {
  // Greeting depends on the visitor's clock, so render it after mount to
  // avoid a server/client mismatch.
  const [hello, setHello] = useState<string | null>(null);
  useEffect(() => setHello(greeting()), []);

  return (
    <header className="gw-glass sticky top-0 z-50 border-b border-border/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="md:hidden">
            <Logo compact />
          </span>
          <div className="min-w-0">
            <p className="h-4 text-xs font-medium text-ink-faint">{hello}</p>
            <p className="truncate text-[15px] font-bold text-ink">{name}</p>
          </div>
        </div>
        <AvatarMenu name={name} email={email} />
      </div>
    </header>
  );
}
