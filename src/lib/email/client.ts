import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends transactional email (confirmation, password reset) through
 * Resend's REST API — a plain fetch call rather than their SDK, so this
 * has no extra dependency to install.
 *
 * If RESEND_API_KEY isn't set, nothing is sent over the network: instead
 * the email (including the confirm/reset link) is logged to the server
 * console so the flow can still be exercised end-to-end during local
 * development. Add RESEND_API_KEY (and optionally EMAIL_FROM) to .env to
 * start sending real email — see README.md.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Ledger <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      [
        "",
        "─── EMAIL NOT SENT (RESEND_API_KEY is not set) ───────────────────",
        `To:      ${to}`,
        `Subject: ${subject}`,
        "",
        text,
        "────────────────────────────────────────────────────────────────",
        "",
      ].join("\n"),
    );
    return { sent: false };
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new EmailDeliveryError(`Resend API error (${res.status}): ${body}`);
  }

  return { sent: true };
}
