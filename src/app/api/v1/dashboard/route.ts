import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/services/dashboard";

// Reads the session cookie via requireSession() on every call, so this
// route can never be statically rendered — declaring it explicitly stops
// Next.js from probing (and logging) that during build.
export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  const summary = await getDashboardSummary(session.userId);
  return NextResponse.json(summary);
});
