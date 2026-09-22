import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl italic text-ink">Ledger</p>
          <p className="mt-1 text-sm text-ink-muted">Choose a new password.</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <ResetPasswordForm token={searchParams.token ?? null} />
        </div>
      </div>
    </main>
  );
}
