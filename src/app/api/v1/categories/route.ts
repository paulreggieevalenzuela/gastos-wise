import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { createCategory, listCategories } from "@/lib/services/categories";
import { createCategorySchema } from "@/lib/validation/category";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const includeArchived = request.nextUrl.searchParams.get("includeArchived") === "true";
  const categories = await listCategories(session.userId, includeArchived);
  return NextResponse.json({ categories });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const body = await request.json();
  const input = createCategorySchema.parse(body);
  const category = await createCategory(session.userId, input);
  return NextResponse.json({ category }, { status: 201 });
});
