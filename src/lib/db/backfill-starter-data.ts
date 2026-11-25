import "dotenv/config";
import { db, sql } from "@/lib/db/client";
import { applyStarterDataSafely } from "@/lib/services/onboarding";

/**
 * Optional: gives every existing account its starter Cash wallet and
 * default categories right now, instead of on their next visit (which
 * happens automatically). Safe to run any number of times — each account
 * only ever gets them once.
 *
 *   DATABASE_URL=<staging or prod URL> yarn db:backfill
 */
async function main() {
  const users = await db.query.users.findMany({
    where: (u, { isNull }) => isNull(u.starterDataAppliedAt),
    columns: { id: true, username: true },
  });
  let applied = 0;
  for (const user of users) {
    const result = await applyStarterDataSafely(user.id);
    if (!result?.applied) continue;
    applied++;
    const parts = [result.walletCreated && "+ Cash wallet", result.categoriesCreated && `+ ${result.categoriesCreated} categories`].filter(Boolean);
    console.log(`  ${user.username}: ${parts.join(", ") || "already had everything"}`);
  }
  console.log(`\nGave starter data to ${applied} of ${users.length} accounts that hadn't had it yet.`);
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
