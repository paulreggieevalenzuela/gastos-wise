import { describe, expect, it } from "vitest";
import { parseAmount, parseQuickAdd, type QuickAddAccount, type QuickAddCategory } from "./parse";

const accounts: QuickAddAccount[] = [
  { id: "cash", name: "Cash", icon: "cash" },
  { id: "bdo", name: "BDO", icon: "bdo" },
  { id: "gcash", name: "GCash", icon: "gcash" },
  { id: "maya", name: "Maya", icon: "maya" },
  { id: "savings", name: "Savings", icon: null },
];

const categories: QuickAddCategory[] = [
  { id: "food", name: "Food", type: "EXPENSE", icon: "utensils" },
  { id: "restaurants", name: "Restaurants", type: "EXPENSE", icon: "utensils", parentId: "food" },
  { id: "groceries", name: "Groceries", type: "EXPENSE", icon: "shopping-cart", parentId: "food" },
  { id: "coffee", name: "Coffee", type: "EXPENSE", icon: "coffee", parentId: "food" },
  { id: "transport", name: "Transportation", type: "EXPENSE", icon: "car" },
  { id: "grab", name: "Grab", type: "EXPENSE", icon: "taxi", parentId: "transport" },
  { id: "bills", name: "Bills", type: "EXPENSE", icon: "receipt" },
  { id: "meralco", name: "Meralco", type: "EXPENSE", icon: "zap", parentId: "bills" },
  { id: "mobile", name: "Mobile Data/Network", type: "EXPENSE", icon: "smartphone", parentId: "bills" },
  { id: "salary", name: "Salary", type: "INCOME", icon: "wallet" },
  { id: "freelance", name: "Freelance", type: "INCOME", icon: "briefcase" },
];

const parse = (text: string) => parseQuickAdd(text, accounts, categories, { defaultAccountId: "cash" });

describe("parseAmount", () => {
  it.each([
    ["245", 245],
    ["₱1,250.50 lunch", 1250.5],
    ["p300 load", 300],
    ["1.5k groceries", 1500],
    ["45k sahod", 45000],
    ["2 libo", 2000],
    ["13th month 5000", 5000],
    ["2 days ago 150", 150],
  ])("%s → %d", (text, expected) => {
    expect(parseAmount(text).amount).toBe(expected);
  });

  it("returns null when there's no number", () => {
    expect(parseAmount("jollibee").amount).toBeNull();
  });
});

describe("parseQuickAdd", () => {
  it("reads amount, merchant category, and wallet", () => {
    const d = parse("245 grab gcash");
    expect(d).toMatchObject({ type: "EXPENSE", amount: 245, accountId: "gcash", categoryId: "grab", complete: true });
  });

  it("maps a known merchant to a category and keeps it as the merchant", () => {
    const d = parse("Jollibee 289 cash kahapon");
    expect(d).toMatchObject({
      amount: 289,
      accountId: "cash",
      categoryId: "restaurants",
      merchant: "Jollibee",
      daysAgo: 1,
    });
  });

  it("understands bills by provider name", () => {
    expect(parse("meralco 2,340 bdo")).toMatchObject({ categoryId: "meralco", accountId: "bdo", amount: 2340 });
    expect(parse("globe load 99 maya")).toMatchObject({ categoryId: "mobile", accountId: "maya", amount: 99 });
  });

  it("detects income in Taglish", () => {
    const d = parse("sahod 45k bdo");
    expect(d).toMatchObject({ type: "INCOME", amount: 45000, accountId: "bdo", categoryId: "salary", merchant: null });
  });

  it("detects transfers between two wallets in order", () => {
    const d = parse("transfer 2,000 from bdo to gcash");
    expect(d).toMatchObject({
      type: "TRANSFER",
      amount: 2000,
      accountId: "bdo",
      transferAccountId: "gcash",
      categoryId: null,
      complete: true,
    });
  });

  it("does not confuse 'gcash' with the Cash account", () => {
    expect(parse("coffee 180 gcash").accountId).toBe("gcash");
  });

  it("falls back to the default wallet and stays incomplete without a category", () => {
    const d = parse("500 something random");
    expect(d.accountId).toBe("cash");
    expect(d.categoryId).toBeNull();
    expect(d.complete).toBe(false);
  });

  it("does not use a bare category name as the merchant", () => {
    expect(parse("groceries 1200 bdo")).toMatchObject({ categoryId: "groceries", merchant: null });
  });

  it("ignores command words from dictation ('add', 'log')", () => {
    expect(parse("add 1,000 sahod")).toMatchObject({ type: "INCOME", amount: 1000, categoryId: "salary", merchant: null });
    expect(parse("log 250 jollibee gcash")).toMatchObject({ merchant: "Jollibee", accountId: "gcash" });
  });

  it("is incomplete without any wallet to use", () => {
    const d = parseQuickAdd("add 1,000 sahod", [], categories);
    expect(d.accountId).toBeNull();
    expect(d.complete).toBe(false);
  });

  it("handles 'paymaya' and filler words", () => {
    expect(parse("nagbayad ako ng 150 sa paymaya para sa kape")).toMatchObject({
      amount: 150,
      accountId: "maya",
      categoryId: "coffee",
      merchant: "Kape",
    });
  });

  describe("switch, remarks and Other fallback", () => {
    const withOther: QuickAddCategory[] = [
      ...categories,
      { id: "other-income", name: "Other Income", type: "INCOME", icon: "circle-plus" },
      { id: "other-expenses", name: "Other Expenses", type: "EXPENSE", icon: "circle" },
    ];
    const p = (text: string, forceType?: "EXPENSE" | "INCOME") =>
      parseQuickAdd(text, accounts, withOther, { defaultAccountId: "cash", forceType });

    it("the Income/Expense switch overrides the words", () => {
      expect(p("500 jollibee", "INCOME")).toMatchObject({ type: "INCOME" });
      expect(p("sahod 45k bdo", "EXPENSE")).toMatchObject({ type: "EXPENSE" });
    });

    it("an unmatched income goes to Other Income (and is marked as a fallback)", () => {
      expect(p("income 1,500 tita")).toMatchObject({
        type: "INCOME",
        amount: 1500,
        categoryId: "other-income",
        categoryIsFallback: true,
        merchant: "Tita",
        complete: true,
      });
    });

    it("an unmatched expense goes to Other Expenses", () => {
      expect(p("750 something random")).toMatchObject({ categoryId: "other-expenses", categoryIsFallback: true });
    });

    it("a real match is never marked as a fallback", () => {
      expect(p("sahod 45k bdo")).toMatchObject({ categoryId: "salary", categoryIsFallback: false });
    });

    it("keeps everything after 'remarks' / 'note' as remarks", () => {
      const d = p("500 grab gcash remarks going to the BGC office");
      expect(d).toMatchObject({ amount: 500, accountId: "gcash", categoryId: "grab", remarks: "going to the BGC office" });
      expect(p("income 2000 note: birthday money from Lola")).toMatchObject({
        type: "INCOME",
        amount: 2000,
        remarks: "birthday money from Lola",
      });
    });

    it("numbers inside remarks don't change the amount", () => {
      expect(p("300 coffee note for 2 people")).toMatchObject({ amount: 300, remarks: "for 2 people" });
    });

    it("'got paid' is still income", () => {
      expect(p("got paid 5000 bdo")).toMatchObject({ type: "INCOME" });
    });
  });
});
