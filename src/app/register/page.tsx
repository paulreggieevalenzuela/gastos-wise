import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl italic text-ink">GastosWise</p>
          <p className="mt-1 text-sm text-ink-muted">
            Create your personal finance account.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
