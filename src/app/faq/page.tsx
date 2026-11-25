import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata = {
  title: "FAQ — GastosWise",
};

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is GastosWise?",
    a: "A personal finance tracker: you log your own income, expenses, accounts, and budgets, and GastosWise organizes and visualizes them for you.",
  },
  {
    q: "Is GastosWise connected to my real bank account?",
    a: "No. There's no bank or payment integration — every transaction, account, and balance in the app is one you've entered yourself.",
  },
  {
    q: "Is my data safe?",
    a: (
      <>
        Your password is hashed (never stored in plain text), and data is
        encrypted in transit. See our{" "}
        <a href="/privacy">Privacy Policy</a> for details on what we collect
        and how it&rsquo;s used.
      </>
    ),
  },
  {
    q: "I registered but didn't get a confirmation email. What do I do?",
    a: "Check your spam/junk folder first. If it's not there, use the “Resend confirmation email” option on the sign-in page.",
  },
  {
    q: "How do I reset my password?",
    a: (
      <>
        Use <a href="/forgot-password">Forgot password</a> on the sign-in
        page. We&rsquo;ll email you a link to set a new one.
      </>
    ),
  },
  {
    q: "What currency does GastosWise use?",
    a: "PHP (Philippine Peso) by default, configurable per account in Settings.",
  },
  {
    q: "Can I delete my account and data?",
    a: (
      <>
        Yes. Email <a href="mailto:hello@gastoswise.app">hello@gastoswise.app</a>{" "}
        from the address on your account and ask us to delete it — we&rsquo;ll
        remove your account and all associated data. (An in-app deletion
        option is planned.)
      </>
    ),
  },
  {
    q: "Is GastosWise free?",
    a: "Yes, it's a free personal project with no subscriptions or ads.",
  },
  {
    q: "Who do I contact for help?",
    a: (
      <>
        Email <a href="mailto:hello@gastoswise.app">hello@gastoswise.app</a> and
        we&rsquo;ll get back to you.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <LegalPageShell title="Frequently Asked Questions" updated="November 25, 2026">
      {faqs.map(({ q, a }) => (
        <div key={q}>
          <h2>{q}</h2>
          <p>{a}</p>
        </div>
      ))}
    </LegalPageShell>
  );
}
