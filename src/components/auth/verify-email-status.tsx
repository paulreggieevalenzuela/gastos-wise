"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = "pending" | "ok" | "error";

export function VerifyEmailStatus({ token }: { token: string | null }) {
  const [status, setStatus] = useState<Status>(token ? "pending" : "error");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "This confirmation link is invalid or has expired.");
          return;
        }
        setStatus("ok");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Couldn't reach the server. Check your connection and try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "pending") {
    return <p className="text-center text-sm text-ink-muted">Confirming your email…</p>;
  }

  if (status === "error") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-negative">
          {message ?? "This confirmation link is invalid or missing its token."}
        </p>
        <Link href="/login" className="inline-block text-sm font-medium text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-ink">Your email is confirmed — you can sign in now.</p>
      <Link
        href="/login"
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-ink transition-colors hover:opacity-90"
      >
        Sign in
      </Link>
    </div>
  );
}
