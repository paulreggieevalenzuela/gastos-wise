/**
 * Validation rules that are about financial correctness, not just shape
 * (shape validation lives in src/lib/validation with zod). Kept separate
 * from the API layer so the same rule can eventually run on a mobile
 * client before it ever reaches the server.
 */

export class DomainError extends Error {}

export function assertValidTransfer(sourceAccountId: string, destinationAccountId: string) {
  if (sourceAccountId === destinationAccountId) {
    throw new DomainError("A transfer must move money between two different accounts.");
  }
}

export function assertPositiveAmount(amountCents: number) {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new DomainError("Amount must be greater than zero.");
  }
}

export function assertCategoryMatchesTransactionType(
  transactionType: "INCOME" | "EXPENSE",
  categoryType: "INCOME" | "EXPENSE",
) {
  if (transactionType !== categoryType) {
    throw new DomainError(
      `A ${transactionType.toLowerCase()} transaction cannot use a ${categoryType.toLowerCase()} category.`,
    );
  }
}
