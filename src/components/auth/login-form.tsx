"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResent(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Try again.");
        setUnverified(data.code === "unverified");
        setLoading(false);
        return;
      }
      const from = searchParams.get("from");
      router.push(from && from.startsWith("/") ? from : "/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setLoading(false);
    }
  }

  async function onResend() {
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      setResent(true);
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="identifier">Username or email</Label>
        <Input
          id="identifier"
          name="identifier"
          autoComplete="username"
          autoFocus
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="mb-1.5">
            Password
          </Label>
          <Link href="/forgot-password" className="mb-1.5 text-xs text-ink-muted hover:text-accent">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <div role="alert" className="rounded-md bg-negative-soft px-3 py-2 text-sm text-negative">
          <p>{error}</p>
          {unverified && (
            <p className="mt-1">
              {resent ? (
                "Confirmation email sent — check your inbox."
              ) : (
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resending}
                  className="font-medium underline underline-offset-2 disabled:opacity-60"
                >
                  {resending ? "Sending…" : "Resend confirmation email"}
                </button>
              )}
            </p>
          )}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-ink hover:text-accent">
          Register
        </Link>
      </p>
    </form>
  );
}
