import Link from "next/link";

export function LegalPageShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-12">
      <Link href="/login" className="text-sm font-medium text-accent hover:underline">
        ← Back to GastosWise
      </Link>
      <h1 className="mt-6 font-display text-3xl text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-muted">Last updated: {updated}</p>
      <div
        className="mt-8 space-y-4 text-sm leading-relaxed text-ink-muted
          [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink
          [&_h2]:first:mt-0
          [&_p]:mt-3
          [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5
          [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2"
      >
        {children}
      </div>
    </main>
  );
}
