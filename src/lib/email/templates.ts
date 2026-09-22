interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

// Hardcoded to the app's light-theme, default-accent (emerald) colors —
// email clients can't read CSS custom properties or the user's chosen
// theme, so these are plain hex fallbacks rather than the app's tokens.
const COLORS = {
  bg: "#f5f5f1",
  surface: "#ffffff",
  border: "#e2e0d8",
  ink: "#16241f",
  inkMuted: "#4b5a54",
  accent: "#1f6f54",
  accentInk: "#ffffff",
};

function layout(opts: { preheader: string; heading: string; body: string; buttonLabel: string; buttonUrl: string; footnote: string }): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:${COLORS.bg};font-family:Georgia,'Times New Roman',serif;">
    <span style="display:none;font-size:1px;color:${COLORS.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${opts.preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:12px;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0;font-style:italic;font-size:22px;color:${COLORS.ink};">Ledger</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;">
                <h1 style="margin:0 0 12px 0;font-size:18px;font-family:Helvetica,Arial,sans-serif;color:${COLORS.ink};">${opts.heading}</h1>
                <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;font-family:Helvetica,Arial,sans-serif;color:${COLORS.inkMuted};">${opts.body}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:8px;background-color:${COLORS.accent};">
                      <a href="${opts.buttonUrl}" style="display:inline-block;padding:12px 20px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:${COLORS.accentInk};text-decoration:none;border-radius:8px;">${opts.buttonLabel}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <p style="margin:0;font-size:12px;line-height:1.6;font-family:Helvetica,Arial,sans-serif;color:${COLORS.inkMuted};">${opts.footnote}</p>
                <p style="margin:12px 0 0 0;font-size:11px;line-height:1.5;font-family:Helvetica,Arial,sans-serif;color:${COLORS.inkMuted};word-break:break-all;">If the button doesn't work, copy and paste this link:<br /><a href="${opts.buttonUrl}" style="color:${COLORS.accent};">${opts.buttonUrl}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verifyEmailTemplate({ name, link }: { name: string; link: string }): EmailContent {
  const subject = "Confirm your email for Ledger";
  const html = layout({
    preheader: "Confirm your email to finish creating your Ledger account.",
    heading: `Welcome, ${name}`,
    body: "Confirm your email address to finish creating your account and sign in. This link expires in 24 hours.",
    buttonLabel: "Confirm email",
    buttonUrl: link,
    footnote: "If you didn't create a Ledger account, you can safely ignore this email.",
  });
  const text = `Welcome to Ledger, ${name}.\n\nConfirm your email address to finish creating your account:\n${link}\n\nThis link expires in 24 hours. If you didn't create a Ledger account, you can safely ignore this email.`;
  return { subject, html, text };
}

export function resetPasswordTemplate({ name, link }: { name: string; link: string }): EmailContent {
  const subject = "Reset your Ledger password";
  const html = layout({
    preheader: "Reset your Ledger password.",
    heading: `Hi ${name}`,
    body: "We received a request to reset your Ledger password. Choose a new one below. This link expires in 1 hour.",
    buttonLabel: "Reset password",
    buttonUrl: link,
    footnote: "If you didn't request this, you can safely ignore this email — your password won't change.",
  });
  const text = `Hi ${name},\n\nWe received a request to reset your Ledger password. Choose a new one:\n${link}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`;
  return { subject, html, text };
}
