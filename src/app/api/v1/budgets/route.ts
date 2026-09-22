import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { createBudget, listBudgetsWithUsage } from "@/lib/services/budgets";
import { createBudgetSchema } from "@/lib/validation/budget";

// Reads the session cookie via requireSession() on every call, so this
// route can never be statically rendered — declaring it explicitly stops
// Next.js from probing (and logging) that during build.
export const dynamic = "force-dynamic";

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
