"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet on phones (slides up, thumb-reachable), centered dialog on
 * larger screens.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  // Portals need `document`; waiting until mount also keeps a modal that
  // starts open (e.g. /transactions?new=1) from breaking hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-start sm:overflow-y-auto sm:p-4 sm:pt-20">
      <div
        className="gw-fade fixed inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "gw-sheet relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl border border-border bg-surface shadow-float sm:max-h-none sm:max-w-md sm:rounded-3xl",
          className,
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-border-strong sm:hidden" aria-hidden />
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3 sm:pt-5">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="gw-press flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-ink-muted hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="pb-safe overflow-y-auto px-5 pt-2 sm:pb-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
