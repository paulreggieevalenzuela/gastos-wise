import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Neutral icon tile for options like "All wallets". */
export function IconTile({ icon: Icon, size = 28, className }: { icon: LucideIcon; size?: number; className?: string }) {
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-lg bg-surface-raised text-ink-muted", className)}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.55)} />
    </span>
  );
}
