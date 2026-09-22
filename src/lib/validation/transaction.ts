import { z } from "zod";

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE", "TRANSFER"] as const;

const baseFields = {
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  currency: z.string().trim().length(3).default("PHP"),
  transactionDate: z.coerce.date(),
  description: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  merchant: z.string().trim().max(120).optional().nullable(),
};

export const createTransactionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("EXPENSE"),
    accountId: z.string().min(1),
    categoryId: z.string().min(1, "Category is required"),
    ...baseFields,
  }),
  z.object({
    type: z.literal("INCOME"),
    accountId: z.string().min(1),
    categoryId: z.string().min(1, "Category is required"),
    ...baseFields,
  }),
  z.object({
    type: z.literal("TRANSFER"),
    accountId: z.string().min(1, "Source account is required"),
    transferAccountId: z.string().min(1, "Destination account is required"),
    ...baseFields,
  }),
]);

export const updateTransactionSchema = z.object({
  accountId: z.string().min(1).optional(),
  categoryId: z.string().min(1).nullable().optional(),
  transferAccountId: z.string().min(1).nullable().optional(),
  amount: z.coerce.number().positive().optional(),
  transactionDate: z.coerce.date().optional(),
  description: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  merchant: z.string().trim().max(120).nullable().optional(),
});

export const transactionFiltersSchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
