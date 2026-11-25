import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata = {
  title: "Terms & Conditions — GastosWise",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms & Conditions" updated="November 25, 2026">
      <p>
        These terms govern your use of GastosWise. By creating an account,
        you agree to them.
      </p>

      <h2>What GastosWise is</h2>
      <p>
        GastosWise is a personal tool for manually tracking your own income,
        expenses, accounts, and budgets. It is not a bank, payment processor,
        or financial institution, does not move or hold money on your
        behalf, and nothing in the app constitutes financial, tax, or
        investment advice.
      </p>

      <h2>Your account</h2>
      <p>
        You&rsquo;re responsible for keeping your login credentials
        confidential and for all activity under your account. Use accurate
        information when registering, and let us know right away if you
        suspect unauthorized access.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use GastosWise for anything unlawful, or to misrepresent your identity.</li>
        <li>Attempt to probe, scan, or breach the security of the service.</li>
        <li>Abuse, scrape, or overload the app or its API beyond normal personal use.</li>
      </ul>

      <h2>Your data</h2>
      <p>
        You own the financial data you enter. We store and process it solely
        to provide the service to you, as described in our{" "}
        <a href="/privacy">Privacy Policy</a>. We don&rsquo;t claim any
        ownership over your content.
      </p>

      <h2>No financial advice</h2>
      <p>
        Any totals, charts, or budget summaries GastosWise shows are
        calculated directly from the data you entered. They&rsquo;re for your
        own reference and are not financial advice or a recommendation to
        take any particular action.
      </p>

      <h2>Availability</h2>
      <p>
        GastosWise is provided &ldquo;as is&rdquo;, without guarantees of
        uptime or that it will always be error-free. Features may change,
        and the service may be suspended or discontinued at any time.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, GastosWise and its developer
        are not liable for any indirect, incidental, or consequential
        damages arising from your use of the app, including from
        inaccuracies in data you entered yourself or from service
        interruptions.
      </p>

      <h2>Termination</h2>
      <p>
        You may stop using GastosWise and request account deletion at any
        time (see our <a href="/faq">FAQ</a> for how). We may suspend or
        terminate accounts that violate these terms.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the Republic of the Philippines.</p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time; the date above reflects
        the latest revision. Continued use after a change means you accept
        the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Reach us at{" "}
        <a href="mailto:hello@gastoswise.app">hello@gastoswise.app</a>.
      </p>
    </LegalPageShell>
  );
}
