/**
 * What every new account starts with: a Cash wallet and a set of everyday
 * Filipino expense and income categories. Used at registration
 * (services/onboarding.ts), by the seed script, and by the backfill script
 * for accounts created before this existed.
 *
 * Icons are keys from CATEGORY_ICONS (lib/icons.ts); colors are keys from
 * CATEGORY_COLOR_CLASSES (lib/category-colors.ts).
 */

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  children?: { name: string; icon: string }[];
}

export const STARTER_WALLET = {
  name: "Cash",
  type: "CASH" as const,
  icon: "cash",
  initialBalance: "0.00",
};

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  {
    name: "Food & Dining",
    icon: "utensils",
    color: "amber",
    children: [
      { name: "Groceries", icon: "shopping-cart" },
      { name: "Restaurants", icon: "utensils" },
      { name: "Coffee & Snacks", icon: "coffee" },
    ],
  },
  {
    name: "Bills & Utilities",
    icon: "receipt",
    color: "rose",
    children: [
      { name: "Electricity (Meralco)", icon: "zap" },
      { name: "Water", icon: "droplet" },
      { name: "Internet", icon: "wifi" },
      { name: "Mobile Load & Data", icon: "smartphone" },
    ],
  },
  {
    name: "Transportation",
    icon: "car",
    color: "sky",
    children: [
      { name: "Grab / Taxi", icon: "taxi" },
      { name: "Commute", icon: "bus" },
      { name: "Fuel", icon: "fuel" },
      { name: "Parking", icon: "parking" },
    ],
  },
  { name: "Rent & Housing", icon: "house", color: "teal" },
  { name: "Shopping", icon: "shopping-bag", color: "violet" },
  {
    name: "Health",
    icon: "heart-pulse",
    color: "emerald",
    children: [{ name: "Medicine", icon: "pill" }],
  },
  { name: "Subscriptions", icon: "repeat", color: "fuchsia" },
  { name: "Entertainment", icon: "clapperboard", color: "fuchsia" },
  { name: "Education", icon: "graduation-cap", color: "sky" },
  { name: "Family & Gifts", icon: "gift", color: "rose" },
  { name: "Other Expenses", icon: "circle", color: "slate" },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: "Salary", icon: "wallet", color: "emerald" },
  { name: "Freelance", icon: "briefcase", color: "teal" },
  { name: "Business", icon: "store", color: "amber" },
  { name: "Allowance & Padala", icon: "hand-coins", color: "violet" },
  { name: "Other Income", icon: "circle-plus", color: "slate" },
];

export interface CategoryRow {
  id: string;
  userId: string;
  name: string;
  type: "EXPENSE" | "INCOME";
  icon: string;
  color: string;
  parentId: string | null;
  sortOrder: number;
}

/** Flattens the defaults into insertable rows (parents before their children). */
export function buildDefaultCategoryRows(userId: string, newId: () => string): CategoryRow[] {
  const rows: CategoryRow[] = [];
  let sortOrder = 0;
  const add = (list: DefaultCategory[], type: CategoryRow["type"]) => {
    for (const cat of list) {
      const parentId = newId();
      rows.push({ id: parentId, userId, name: cat.name, type, icon: cat.icon, color: cat.color, parentId: null, sortOrder: sortOrder++ });
      for (const child of cat.children ?? []) {
        rows.push({
          id: newId(),
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
  add(DEFAULT_EXPENSE_CATEGORIES, "EXPENSE");
  add(DEFAULT_INCOME_CATEGORIES, "INCOME");
  return rows;
}
