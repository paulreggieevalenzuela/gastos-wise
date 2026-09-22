import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/services/dashboard";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  const summary = await getDashboardSummary(session.userId);
  return NextResponse.json(summary);
});
