import { VerifyEmailStatus } from "@/components/auth/verify-email-status";
import { Logo } from "@/components/layout/logo";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <VerifyEmailStatus token={searchParams.token ?? null} />
        </div>
      </div>
    </main>
  );
}
