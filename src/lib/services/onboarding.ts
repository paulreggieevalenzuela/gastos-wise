import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { createId } from "@/lib/db/cuid";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  STARTER_WALLET,
  type DefaultCategory,
} from "@/lib/defaults";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface StarterDataResult {
  applied: boolean;
  walletCreated: boolean;
  categoriesCreated: number;
}

/**
 * Older names for the same defaults (from the first version of the seed
 * script), so accounts that already have "Bills" or "Meralco" don't get a
 * second "Bills & Utilities" or "Electricity (Meralco)" next to them.
 */
const EQUIVALENT_NAMES: Record<string, string[]> = {
  "food & dining": ["food"],
  "bills & utilities": ["bills", "utilities"],
  "electricity (meralco)": ["meralco", "electricity"],
  "mobile load & data": ["mobile data/network", "mobile", "load"],
  "coffee & snacks": ["coffee"],
  "grab / taxi": ["grab", "taxi"],
  "rent & housing": ["rent", "housing"],
  "other expenses": ["other"],
};

const norm = (s: string) => s.trim().toLowerCase();

function namesFor(defaultName: string): string[] {
  const n = norm(defaultName);
  return [n, ...(EQUIVALENT_NAMES[n] ?? [])];
}

/**
 * Gives an account the starter Cash wallet and default categories —
 * exactly once. Works for brand-new accounts (everything is added) and for
 * existing ones (only what's missing is added; categories they already
 * have, by name, are kept as they are).
 *
 * The once-only guarantee comes from users.starter_data_applied_at: it's
 * claimed atomically at the start, so two requests can't both add, and
 * anything the person deletes later is never put back.
 */
export async function applyStarterData(userId: string, tx: Transaction): Promise<StarterDataResult> {
  const result: StarterDataResult = { applied: false, walletCreated: false, categoriesCreated: 0 };

  const claimed = await tx
    .update(schema.users)
    .set({ starterDataAppliedAt: new Date() })
    .where(and(eq(schema.users.id, userId), isNull(schema.users.starterDataAppliedAt)))
    .returning({ id: schema.users.id, currency: schema.users.currency });
  const user = claimed[0];
  if (!user) return result; // already applied (or another request is doing it)
  result.applied = true;

  // Wallet: every account starts with Cash.
  const existingCash = await tx.query.accounts.findFirst({
    where: (a, { and: andOp, eq: eqOp }) => andOp(eqOp(a.userId, userId), eqOp(a.type, "CASH")),
    columns: { id: true },
  });
  if (!existingCash) {
    await tx.insert(schema.accounts).values({
      id: createId(),
      userId,
      name: STARTER_WALLET.name,
      type: STARTER_WALLET.type,
      icon: STARTER_WALLET.icon,
      currency: user.currency,
      initialBalance: STARTER_WALLET.initialBalance,
      sortOrder: 0,
    });
    result.walletCreated = true;
  }

  // Categories: add only the defaults this account doesn't already have.
  const existing = await tx.query.categories.findMany({
    where: (c, { eq: eqOp }) => eqOp(c.userId, userId),
    columns: { id: true, name: true, type: true, parentId: true, sortOrder: true },
  });
  let sortOrder = existing.reduce((max, c) => Math.max(max, c.sortOrder), -1) + 1;
  const rows: (typeof schema.categories.$inferInsert)[] = [];

  const findExistingTopLevel = (name: string, type: "EXPENSE" | "INCOME") => {
    const names = namesFor(name);
    return existing.find((c) => c.type === type && !c.parentId && names.includes(norm(c.name)));
  };

  const addAll = (list: DefaultCategory[], type: "EXPENSE" | "INCOME") => {
    for (const cat of list) {
      let parentId = findExistingTopLevel(cat.name, type)?.id;
      if (!parentId) {
        parentId = createId();
        rows.push({ id: parentId, userId, name: cat.name, type, icon: cat.icon, color: cat.color, sortOrder: sortOrder++ });
      }
      for (const child of cat.children ?? []) {
        // Any category of this type with the same name counts — it may have been moved or made top-level.
        const childNames = namesFor(child.name);
        const alreadyThere = existing.some((c) => c.type === type && childNames.includes(norm(c.name)));
        if (alreadyThere) continue;
        rows.push({
          id: createId(),
          userId,
          name: child.name,
          type,
          icon: child.icon,
          color: cat.color,
          parentId,
          sortOrder: sortOrder++,
        });
      }
    }
  };
  addAll(DEFAULT_EXPENSE_CATEGORIES, "EXPENSE");
  addAll(DEFAULT_INCOME_CATEGORIES, "INCOME");

  if (rows.length > 0) {
    await tx.insert(schema.categories).values(rows);
    result.categoriesCreated = rows.length;
  }

  return result;
}

/** Applies starter data in its own transaction. Never throws — the app works without it. */
export async function applyStarterDataSafely(userId: string): Promise<StarterDataResult | null> {
  try {
    return await db.transaction((tx) => applyStarterData(userId, tx));
  } catch (err) {
    console.error("[onboarding] Couldn't add starter data for", userId, err);
    return null;
  }
}
