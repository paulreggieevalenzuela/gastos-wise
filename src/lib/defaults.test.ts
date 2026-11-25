import { describe, expect, it } from "vitest";
import { CATEGORY_ICONS } from "@/lib/icons";
import { CATEGORY_COLOR_CLASSES } from "@/lib/category-colors";
import { buildDefaultCategoryRows } from "@/lib/defaults";
import { parseQuickAdd } from "@/lib/quick-add/parse";

let n = 0;
const rows = buildDefaultCategoryRows("user-1", () => `id-${++n}`);

describe("default categories", () => {
  it("uses only icons and colors the app knows", () => {
    for (const row of rows) {
      expect(CATEGORY_ICONS[row.icon], row.name).toBeDefined();
      expect(CATEGORY_COLOR_CLASSES[row.color], row.name).toBeDefined();
    }
  });

  it("lists every parent before its children, with unique names", () => {
    const seen = new Set<string>();
    for (const row of rows) {
      if (row.parentId) expect(seen.has(row.parentId), row.name).toBe(true);
      seen.add(row.id);
    }
    expect(new Set(rows.map((r) => `${r.type}:${r.name}`)).size).toBe(rows.length);
  });

  it("includes the everyday bills", () => {
    const names = rows.map((r) => r.name);
    expect(names).toEqual(
      expect.arrayContaining(["Electricity (Meralco)", "Water", "Internet", "Mobile Load & Data", "Salary"]),
    );
  });
});

describe("quick add understands the default categories", () => {
  const categories = rows.map((r) => ({ id: r.name, name: r.name, type: r.type, icon: r.icon, parentId: r.parentId }));
  const accounts = [{ id: "cash", name: "Cash", icon: "cash" }];
  const categoryFor = (text: string) =>
    parseQuickAdd(text, accounts, categories, { defaultAccountId: "cash" }).categoryId;

  it.each([
    ["meralco 2,340", "Electricity (Meralco)"],
    ["kuryente 1800", "Electricity (Meralco)"],
    ["water 640", "Water"],
    ["maynilad 640", "Water"],
    ["pldt 1699", "Internet"],
    ["globe load 99", "Mobile Load & Data"],
    ["grab 245", "Grab / Taxi"],
    ["jeep 13", "Commute"],
    ["jollibee 289", "Restaurants"],
    ["kape 150", "Coffee & Snacks"],
    ["puregold 2,800", "Groceries"],
    ["netflix 549", "Subscriptions"],
    ["sahod 45k", "Salary"],
  ])("%s → %s", (text, expected) => {
    expect(categoryFor(text)).toBe(expected);
  });
});
