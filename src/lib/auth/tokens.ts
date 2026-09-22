import { createHash, randomBytes } from "crypto";

/**
 * Tokens for the email-confirmation and password-reset links. Only the
 * SHA-256 hash is ever persisted (see schema.ts) — the raw token exists
 * solely inside the emailed link, so a database leak alone can't be used
 * to confirm an account or reset a password.
 */
export function generateToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
