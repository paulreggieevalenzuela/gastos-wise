"use client";

import { useEffect, useState } from "react";

function format(value: number) {
  return value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Counts a peso amount up from zero once on mount (skipped for "Reduce motion"). */
export function CountUp({
  value,
  prefix = "₱",
  durationMs = 1400,
  delayMs = 0,
}: {
  value: number;
  prefix?: string;
  durationMs?: number;
  delayMs?: number;
}) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let start: number | null = null;
    setDisplay(0);

    const step = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    const timeout = window.setTimeout(() => {
      frame = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs, delayMs]);

  return (
    <span className="font-tabular">
      {prefix}
      {format(display)}
    </span>
  );
}
