import { cn } from "@/lib/utils";

/** The GW mark + wordmark, in the current accent color. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-accent to-accent-strong text-[11px] font-extrabold tracking-tight text-accent-ink shadow-glow">
        <span className="absolute inset-x-1.5 top-1 h-1.5 rounded-full bg-white/20" aria-hidden />
        GW
      </span>
      {!compact && <span className="text-[17px] font-extrabold tracking-tight text-ink">GastosWise</span>}
    </span>
  );
}
