import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";
import { createId } from "./cuid";
import { buildDefaultCategoryRows } from "../defaults";
import bcrypt from "bcryptjs";

/**
 * Seeds one convenience dev/mock user (see README "Authentication") plus a
 * starter set of accounts and categories so the app isn't empty on first
 * run. Safe to re-run: it upserts the user by username and skips
 * accounts/categories if that user already has any.
 *
 * This user is auto-verified (emailVerifiedAt set immediately) — there's
 * no inbox behind MOCK_USER_EMAIL by default, so it skips the confirmation
 * flow that real registrations (via /register) go through.
 *
 * Run with: pnpm db:seed
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
  }
  const sql = postgres(connectionString, {
    max: 1,
    ssl: connectionString.includes("sslmode=disable") ? false : "require",
  });
  const db = drizzle(sql, { schema });

  const username = process.env.MOCK_USER_USERNAME ?? "paulreggie05";
  const email = process.env.MOCK_USER_EMAIL ?? "paulreggie05@example.com";
  const password = process.env.MOCK_USER_PASSWORD ?? "123456789";
  const name = process.env.MOCK_USER_NAME ?? "Paul";

  const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.username, username) });

  const userId = existing?.id ?? createId();
  if (existing) {
    console.log(`User "${username}" already exists — updating password and leaving data as-is.`);
    await db
      .update(schema.users)
      .set({
        passwordHash: await bcrypt.hash(password, 10),
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, existing.id));
  } else {
    await db.insert(schema.users).values({
      id: userId,
      username,
      email,
      emailVerifiedAt: new Date(),
      // The seed adds its own demo wallets and the default categories below.
      starterDataAppliedAt: new Date(),
      passwordHash: await bcrypt.hash(password, 10),
      name,
      currency: "PHP",
      timezone: "Asia/Manila",
    });
    console.log(`Created user "${username}" (${name}).`);
  }

  const accountCount = await db.query.accounts.findFirst({
    where: (a, { eq }) => eq(a.userId, userId),
  });

  if (!accountCount) {
    const accountSeed = [
      { name: "Cash", type: "CASH" as const, icon: "cash", initialBalance: "2500.00" },
      { name: "BDO", type: "BANK" as const, icon: "bdo", initialBalance: "45000.00" },
      { name: "GCash", type: "EWALLET" as const, icon: "gcash", initialBalance: "3200.00" },
      { name: "Savings", type: "SAVINGS" as const, icon: null, initialBalance: "75000.00" },
    ];
    await db.insert(schema.accounts).values(
      accountSeed.map((a, i) => ({
        id: createId(),
        userId,
        name: a.name,
        type: a.type,
        icon: a.icon,
        initialBalance: a.initialBalance,
        sortOrder: i,
      })),
    );
    console.log(`Seeded ${accountSeed.length} accounts.`);
  }

  const categoryCount = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.userId, userId),
  });

  if (!categoryCount) {
    // Same defaults every new registration gets (src/lib/defaults.ts).
    const rows = buildDefaultCategoryRows(userId, createId);
    await db.insert(schema.categories).values(rows);
    console.log(`Seeded ${rows.length} default categories.`);
  }

  console.log("\nDone. Log in with:");
  console.log(`  username: ${username}`);
  console.log(`  password: ${password}`);

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
