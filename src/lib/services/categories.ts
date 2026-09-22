import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { ConflictError, NotFoundError } from "@/lib/api/handler";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validation/category";
import { createId } from "@/lib/db/cuid";

export async function listCategories(userId: string, includeArchived = false) {
  const rows = await db.query.categories.findMany({
    where: (c, { eq: eqOp }) => eqOp(c.userId, userId),
    orderBy: (c, { asc }) => [asc(c.sortOrder), asc(c.createdAt)],
  });
  return includeArchived ? rows : rows.filter((c) => !c.isArchived);
}

export async function createCategory(userId: string, input: CreateCategoryInput) {
  if (input.parentId) {
    const parent = await db.query.categories.findFirst({
      where: (c, { eq: eqOp, and: andOp }) => andOp(eqOp(c.id, input.parentId!), eqOp(c.userId, userId)),
    });
    if (!parent) throw new NotFoundError("Parent category not found");
  }
  const [category] = await db
    .insert(categories)
    .values({
      id: createId(),
      userId,
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
      parentId: input.parentId ?? null,
    })
    .returning();
  return category;
}

export async function updateCategory(userId: string, id: string, input: UpdateCategoryInput) {
  const existing = await db.query.categories.findFirst({
    where: (c, { eq: eqOp, and: andOp }) => andOp(eqOp(c.id, id), eqOp(c.userId, userId)),
  });
  if (!existing) throw new NotFoundError("Category not found");

  const [updated] = await db
    .update(categories)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      ...(input.isArchived !== undefined ? { isArchived: input.isArchived } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  return updated;
}

export async function deleteCategory(userId: string, id: string) {
  const existing = await db.query.categories.findFirst({
    where: (c, { eq: eqOp, and: andOp }) => andOp(eqOp(c.id, id), eqOp(c.userId, userId)),
  });
  if (!existing) throw new NotFoundError("Category not found");

  const [referencingTx, referencingChild, referencingBudget] = await Promise.all([
    db.query.transactions.findFirst({ where: (t, { eq: eqOp }) => eqOp(t.categoryId, id) }),
    db.query.categories.findFirst({ where: (c, { eq: eqOp }) => eqOp(c.parentId, id) }),
    db.query.budgets.findFirst({ where: (b, { eq: eqOp }) => eqOp(b.categoryId, id) }),
  ]);
  if (referencingTx || referencingBudget) {
    throw new ConflictError(
      "This category is used by transactions or a budget. Archive it instead of deleting it.",
    );
  }
  if (referencingChild) {
    throw new ConflictError("This category has subcategories. Remove or move those first.");
  }

  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}
