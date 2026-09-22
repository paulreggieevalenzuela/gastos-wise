import { z } from "zod";

export const ACCOUNT_TYPES = ["CASH", "BANK", "EWALLET", "SAVINGS", "CREDIT_CARD", "OTHER"] as const;

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  type: z.enum(ACCOUNT_TYPES),
  currency: z.string().trim().length(3).default("PHP"),
  initialBalance: z.coerce.number().finite().default(0),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
