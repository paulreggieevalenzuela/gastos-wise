import { db } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";

export async function authenticateUser(email: string, password: string) {
  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, email) });
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return user;
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, id) });
}
