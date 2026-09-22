import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { createBudget, listBudgetsWithUsage } from "@/lib/services/budgets";
import { createBudgetSchema } from "@/lib/validation/budget";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  const budgets = await listBudgetsWithUsage(session.userId);
  return NextResponse.json({ budgets });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const body = await request.json();
  const input = createBudgetSchema.parse(body);
  const budget = await createBudget(session.userId, input);
  return NextResponse.json({ budget }, { status: 201 });
});
