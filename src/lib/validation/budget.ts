import { z } from "zod";

export const BUDGET_PERIODS = ["MONTHLY", "WEEKLY", "YEARLY"] as const;

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Budget amount must be greater than zero"),
  period: z.enum(BUDGET_PERIODS).default("MONTHLY"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
