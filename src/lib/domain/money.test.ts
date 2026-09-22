import { describe, expect, it } from "vitest";
import { addCents, formatCents, fromCents, toCents } from "./money";

describe("toCents / fromCents", () => {
  it("round-trips a decimal amount", () => {
    expect(toCents(1234.5)).toBe(123450);
    expect(fromCents(123450)).toBe(1234.5);
  });

  it("parses numeric strings (as amounts arrive from Prisma.Decimal.toString())", () => {
    expect(toCents("350.00")).toBe(35000);
  });

  it("rejects non-numeric input", () => {
    expect(() => toCents("not-a-number")).toThrow();
  });
});

describe("addCents", () => {
  it("sums a list of cent values", () => {
    expect(addCents(100, 200, 300)).toBe(600);
    expect(addCents()).toBe(0);
  });
});

describe("formatCents", () => {
  it("formats cents as a currency string", () => {
    // Intl output uses a non-breaking space before PHP in en-PH; just check the digits/symbol.
    expect(formatCents(125450 * 100, "PHP")).toContain("125,450.00");
  });
});
