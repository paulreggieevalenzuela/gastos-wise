"use client";

import { useEffect, useState } from "react";

const TAGLINE = "Your money, mapped.";

/**
 * Full-screen loading state. Next.js renders this automatically while a
 * route segment's server component (session lookup, initial data) is
 * still resolving — see src/app/loading.tsx and src/app/(app)/loading.tsx.
 *
 * The percentage is a perceived-progress animation, not a real one — the
 * server render gives no granular signal to report, so it eases toward
 * ~92% and simply unmounts (React swaps in the real page) whenever the
 * segment actually finishes, the same trick used by top-of-page progress
 * bars like GitHub's or YouTube's.
 */
export function LoadingScreen() {
  const [progress, setProgress] = useState(6);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const taglineTimer = setTimeout(() => setShowTagline(true), 200);

    let raf = 0;
    let start: number | null = null;

    function tick(timestamp: number) {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const eased = 92 * (1 - Math.exp(-elapsed / 850));
      setProgress(Math.max(6, Math.min(92, eased)));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      clearTimeout(taglineTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const pct = Math.round(progress);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-surface"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-2xl italic text-ink">Ledger</span>

        <div className="flex w-44 flex-col items-center gap-2">
          {/* the "ledger line" — a thin ink rule that fills in as a progress bar */}
          <div
            className="relative h-px w-full overflow-hidden bg-border"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-tabular text-[11px] text-ink-faint">{pct}%</span>
        </div>
      </div>

      <p
        className={`text-sm text-ink-muted transition-opacity duration-700 ${
          showTagline ? "opacity-100" : "opacity-0"
        }`}
      >
        {TAGLINE}
      </p>

      <span className="sr-only">Loading Ledger…</span>
    </div>
  );
}
