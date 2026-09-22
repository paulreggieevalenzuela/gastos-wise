import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

/**
 * Applies every SQL file in /drizzle to the database at DATABASE_URL.
 * Run with: pnpm db:migrate (or npm run db:migrate)
 *
 * If this can't reach your Neon project from where you're running it,
 * open the Neon SQL editor instead and paste the contents of the latest
 * file under drizzle/ — see README.md "Database setup".
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
  const db = drizzle(sql);
  console.log("Applying migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
