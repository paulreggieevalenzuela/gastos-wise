import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { createTransaction, listTransactions } from "@/lib/services/transactions";
import { createTransactionSchema, transactionFiltersSchema } from "@/lib/validation/transaction";

// Reads the session cookie via requireSession() on every call, so this
// route can never be statically rendered — declaring it explicitly stops
// Next.js from probing (and logging) that during build.
export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = transactionFiltersSchema.parse(params);
  const result = await listTransactions(session.userId, filters);
  return NextResponse.json(result);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const body = await request.json();
  const input = createTransactionSchema.parse(body);
  const transaction = await createTransaction(session.userId, input);
  return NextResponse.json({ transaction }, { status: 201 });
});
