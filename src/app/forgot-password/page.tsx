import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthFooterLinks } from "@/components/auth/auth-footer-links";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl italic text-ink">GastosWise</p>
          <p className="mt-1 text-sm text-ink-muted">Reset your password.</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <ForgotPasswordForm />
        </div>
        <AuthFooterLinks />
      </div>
    </main>
  );
}
