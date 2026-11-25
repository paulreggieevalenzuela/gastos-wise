import Link from "next/link";

export function AuthFooterLinks() {
  return (
    <p className="mt-6 text-center text-xs text-ink-faint">
      <Link href="/faq" className="hover:text-ink-muted hover:underline">
        FAQ
      </Link>
      <span className="mx-2">·</span>
      <Link href="/privacy" className="hover:text-ink-muted hover:underline">
        Privacy
      </Link>
      <span className="mx-2">·</span>
      <Link href="/terms" className="hover:text-ink-muted hover:underline">
        Terms
      </Link>
    </p>
  );
}
