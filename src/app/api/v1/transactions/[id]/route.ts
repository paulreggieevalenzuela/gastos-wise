import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { deleteTransaction, getTransaction, updateTransaction } from "@/lib/services/transactions";
import { updateTransactionSchema } from "@/lib/validation/transaction";

// Reads the session cookie via requireSession() on every call, so this
// route can never be statically rendered — declaring it explicitly stops
// Next.js from probing (and logging) that during build.
export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export const GET = withErrorHandling(async (_request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  const transaction = await getTransaction(session.userId, params.id);
  return NextResponse.json({ transaction });
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  const body = await request.json();
  const input = updateTransactionSchema.parse(body);
  const transaction = await updateTransaction(session.userId, params.id, input);
  return NextResponse.json({ transaction });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  await deleteTransaction(session.userId, params.id);
  return NextResponse.json({ ok: true });
});
