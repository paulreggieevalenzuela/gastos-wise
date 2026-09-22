import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __expenseTrackerSql: ReturnType<typeof postgres> | undefined;
}

function createSqlClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill in your Neon connection string.",
    );
  }
  // Neon (and most managed Postgres) require SSL; postgres.js needs this
  // explicitly since the sandbox-free connection string form doesn't set it.
  return postgres(connectionString, {
    ssl: connectionString.includes("sslmode=disable") ? false : "require",
    max: 10,
    idle_timeout: 20,
  });
}

// Reuse the connection pool across hot reloads in dev.
const sql = globalThis.__expenseTrackerSql ?? createSqlClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__expenseTrackerSql = sql;
}

export const db = drizzle(sql, { schema });
export { sql };
