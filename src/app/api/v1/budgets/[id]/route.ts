import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { deleteBudget, updateBudget } from "@/lib/services/budgets";
import { updateBudgetSchema } from "@/lib/validation/budget";

interface Params {
  params: { id: string };
}

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  const body = await request.json();
  const input = updateBudgetSchema.parse(body);
  const budget = await updateBudget(session.userId, params.id, input);
  return NextResponse.json({ budget });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  await deleteBudget(session.userId, params.id);
  return NextResponse.json({ ok: true });
});
