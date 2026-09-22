import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import type { User } from "@/lib/db/schema";
import { createId } from "@/lib/db/cuid";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/client";
import { verifyEmailTemplate, resetPasswordTemplate } from "@/lib/email/templates";
import { ConflictError } from "@/lib/api/handler";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function appUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export type AuthResult =
  | { status: "ok"; user: User }
  | { status: "invalid_credentials" }
  | { status: "unverified"; user: User };

/** Looks a user up by username OR email (the login form accepts either). */
export async function authenticateUser(identifier: string, password: string): Promise<AuthResult> {
  const normalized = identifier.trim();
  const user = await db.query.users.findFirst({
    where: (u, { eq, or }) => or(eq(u.username, normalized), eq(u.email, normalized.toLowerCase())),
  });
  if (!user) return { status: "invalid_credentials" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { status: "invalid_credentials" };

  if (!user.emailVerifiedAt) return { status: "unverified", user };
  return { status: "ok", user };
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, id) });
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  name?: string;
}

/** Creates a new account and emails a confirmation link. The account can't sign in until it's clicked. */
export async function registerUser(input: RegisterInput): Promise<User> {
  const existingUsername = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.username, input.username),
  });
  if (existingUsername) throw new ConflictError("That username is already taken.");

  const existingEmail = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, input.email),
  });
  if (existingEmail) throw new ConflictError("An account with that email already exists.");

  const passwordHash = await hashPassword(input.password);
  const userId = createId();

  await db.insert(schema.users).values({
    id: userId,
    username: input.username,
    email: input.email,
    passwordHash,
    name: input.name?.trim() || input.username,
  });

  const user = await getUserById(userId);
  if (!user) throw new Error("Failed to create user.");

  await issueEmailVerification(user);

  return user;
}

async function issueEmailVerification(user: User) {
  const { token, tokenHash } = generateToken();
  await db.insert(schema.emailVerificationTokens).values({
    id: createId(),
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
  });

  const link = `${appUrl()}/verify-email?token=${token}`;
  const { subject, html, text } = verifyEmailTemplate({ name: user.name, link });
  await sendEmail({ to: user.email, subject, html, text });
}

/** Re-sends the confirmation email. Silently no-ops for unknown/already-verified accounts — never reveals which. */
export async function resendVerificationEmail(identifier: string): Promise<void> {
  const normalized = identifier.trim();
  const user = await db.query.users.findFirst({
    where: (u, { eq, or }) => or(eq(u.username, normalized), eq(u.email, normalized.toLowerCase())),
  });
  if (!user || user.emailVerifiedAt) return;
  await issueEmailVerification(user);
}

export async function verifyEmail(token: string): Promise<{ status: "ok" | "invalid" }> {
  const tokenHash = hashToken(token);
  const record = await db.query.emailVerificationTokens.findFirst({
    where: (t, { eq }) => eq(t.tokenHash, tokenHash),
  });
  if (!record || record.expiresAt < new Date()) {
    return { status: "invalid" };
  }

  await db
    .update(schema.users)
    .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, record.userId));

  await db
    .delete(schema.emailVerificationTokens)
    .where(eq(schema.emailVerificationTokens.userId, record.userId));

  return { status: "ok" };
}

/** Emails a reset link if the address matches an account. Always no-ops silently otherwise — never reveals whether an email is registered. */
export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, normalized) });
  if (!user) return;

  const { token, tokenHash } = generateToken();
  await db.insert(schema.passwordResetTokens).values({
    id: createId(),
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
  });

  const link = `${appUrl()}/reset-password?token=${token}`;
  const { subject, html, text } = resetPasswordTemplate({ name: user.name, link });
  await sendEmail({ to: user.email, subject, html, text });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ status: "ok" | "invalid" }> {
  const tokenHash = hashToken(token);
  const record = await db.query.passwordResetTokens.findFirst({
    where: (t, { eq }) => eq(t.tokenHash, tokenHash),
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { status: "invalid" };
  }

  const passwordHash = await hashPassword(newPassword);
  await db
    .update(schema.users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(schema.users.id, record.userId));

  await db
    .update(schema.passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.passwordResetTokens.id, record.id));

  // Any other outstanding reset links for this user are now stale — drop them too.
  await db
    .delete(schema.passwordResetTokens)
    .where(and(eq(schema.passwordResetTokens.userId, record.userId), isNull(schema.passwordResetTokens.usedAt)));

  return { status: "ok" };
}
