import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata = {
  title: "Privacy Policy — GastosWise",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="November 25, 2026">
      <p>
        GastosWise (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a personal finance
        and expense-tracking app. This policy explains what information we
        collect when you use it, why, and what control you have over it.
      </p>

      <h2>Information we collect</h2>
      <p>When you create an account, we collect:</p>
      <ul>
        <li>Your username, email address, and a securely hashed password (we never store your password in plain text).</li>
        <li>
          The financial data you choose to enter yourself — accounts,
          transactions, categories, and budgets. GastosWise does not connect
          to your bank or any payment provider; every figure in the app is
          one you typed in.
        </li>
        <li>Basic preferences, like your chosen currency, timezone, and theme.</li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Your data is used only to provide the app&rsquo;s core functionality:
        showing you your own accounts, transactions, budgets, and the
        dashboards built from them. We don&rsquo;t use your data for
        advertising, and we don&rsquo;t sell or rent it to anyone.
      </p>

      <h2>Emails we send</h2>
      <p>
        We use a third-party email delivery service (Resend) to send
        transactional emails only: confirming your email address when you
        register, and password-reset links when you request one. We don&rsquo;t
        send marketing or newsletter email.
      </p>

      <h2>Cookies &amp; sessions</h2>
      <p>
        GastosWise sets a single, secure, HTTP-only session cookie to keep you
        signed in. It&rsquo;s strictly functional — we don&rsquo;t use
        advertising or analytics cookies, and we don&rsquo;t track you across
        other sites.
      </p>

      <h2>Where your data lives</h2>
      <p>
        Your data is stored in a managed PostgreSQL database and encrypted in
        transit (TLS/SSL). Access is limited to what the app itself needs to
        function.
      </p>

      <h2>Your rights</h2>
      <p>
        You can review and edit most of your data directly in the app. To
        request a copy of your data, or to have your account and all
        associated data permanently deleted, contact us at{" "}
        <a href="mailto:hello@gastoswise.app">hello@gastoswise.app</a>. We&rsquo;ll
        act on deletion requests within a reasonable time.
      </p>

      <h2>Children&rsquo;s privacy</h2>
      <p>
        GastosWise is not directed at children, and we do not knowingly
        collect information from anyone under the minimum age of digital
        consent in their country.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If this policy changes, we&rsquo;ll update the date above. Continued
        use of GastosWise after a change means you accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Reach us at{" "}
        <a href="mailto:hello@gastoswise.app">hello@gastoswise.app</a>.
      </p>
    </LegalPageShell>
  );
}
