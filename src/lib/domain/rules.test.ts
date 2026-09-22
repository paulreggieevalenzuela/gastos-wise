import { describe, expect, it } from "vitest";
import {
  DomainError,
  assertCategoryMatchesTransactionType,
  assertPositiveAmount,
  assertValidTransfer,
} from "./rules";

describe("assertValidTransfer", () => {
  it("rejects a transfer to the same account", () => {
    expect(() => assertValidTransfer("acc1", "acc1")).toThrow(DomainError);
  });

  it("allows a transfer between two different accounts", () => {
    expect(() => assertValidTransfer("acc1", "acc2")).not.toThrow();
  });
});

describe("assertPositiveAmount", () => {
  it("rejects zero and negative amounts", () => {
    expect(() => assertPositiveAmount(0)).toThrow(DomainError);
    expect(() => assertPositiveAmount(-100)).toThrow(DomainError);
  });

  it("allows a positive amount", () => {
    expect(() => assertPositiveAmount(100)).not.toThrow();
  });
});

describe("assertCategoryMatchesTransactionType", () => {
  it("rejects an expense transaction using an income category", () => {
    expect(() => assertCategoryMatchesTransactionType("EXPENSE", "INCOME")).toThrow(DomainError);
  });

  it("allows a matching type", () => {
    expect(() => assertCategoryMatchesTransactionType("EXPENSE", "EXPENSE")).not.toThrow();
  });
});
