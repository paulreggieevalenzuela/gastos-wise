"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConfirmRequest {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  /** Throw to keep the dialog open and show the message. */
  onConfirm: () => Promise<void> | void;
  /** Offered after a failed confirm, e.g. "Archive instead". */
  fallback?: { label: string; onClick: () => Promise<void> | void };
}

/**
 * "Are you sure?" for destructive actions. Cancel has focus by default, so
 * a stray Enter never deletes anything; Esc cancels just this dialog even
 * when it's opened from inside a sheet.
 */
export function ConfirmDialog({ request, onClose }: { request: ConfirmRequest | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Parents usually pass an inline onClose; keep the latest one in a ref so
  // re-renders (e.g. while the delete request is in flight) don't reset state.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => setMounted(true), []);

  // Fresh state for each new request.
  useEffect(() => {
    if (!request) return;
    setError(null);
    setBusy(false);
    const t = setTimeout(() => cancelRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [request]);

  useEffect(() => {
    if (!request) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        onCloseRef.current();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [request]);

  if (!request || !mounted) return null;

  async function run(action: () => Promise<void> | void) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <div className="gw-fade absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !busy && onClose()} aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="gw-pop pb-safe relative w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-float sm:pb-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-negative-soft text-negative">
            <AlertTriangle size={19} />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-base font-bold text-ink">
              {request.title}
            </h2>
            <div id="confirm-desc" className="mt-1 text-sm text-ink-muted">
              {request.description ?? "This can't be undone."}
            </div>
          </div>
        </div>

        {error && (
          <p className="gw-fade mt-4 rounded-xl bg-negative-soft px-3 py-2 text-sm font-medium text-negative">{error}</p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button ref={cancelRef} type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          {error && request.fallback ? (
            <Button type="button" variant="soft" onClick={() => run(request.fallback!.onClick)} disabled={busy}>
              {request.fallback.label}
            </Button>
          ) : (
            <Button type="button" variant="danger" onClick={() => run(request.onConfirm)} disabled={busy}>
              {busy ? "Deleting…" : request.confirmLabel ?? "Delete"}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
