import { z } from "zod";

export const CATEGORY_TYPES = ["INCOME", "EXPENSE"] as const;

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  type: z.enum(CATEGORY_TYPES),
  icon: z.string().trim().min(1).max(40).default("circle"),
  color: z.string().trim().min(1).max(40).default("slate"),
  parentId: z.string().nullable().optional(),
});

// `type` is intentionally omitted from updates: changing it retroactively
// would desync every historic transaction that already used this category
// under the old type (see domain/rules.ts assertCategoryMatchesTransactionType).
export const updateCategorySchema = createCategorySchema
  .omit({ type: true })
  .partial()
  .extend({
    isArchived: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
