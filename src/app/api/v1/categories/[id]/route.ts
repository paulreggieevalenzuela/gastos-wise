import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { deleteCategory, updateCategory } from "@/lib/services/categories";
import { updateCategorySchema } from "@/lib/validation/category";

interface Params {
  params: { id: string };
}

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  const body = await request.json();
  const input = updateCategorySchema.parse(body);
  const category = await updateCategory(session.userId, params.id, input);
  return NextResponse.json({ category });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  await deleteCategory(session.userId, params.id);
  return NextResponse.json({ ok: true });
});
