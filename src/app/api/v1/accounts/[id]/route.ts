import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { deleteAccount, getAccount, updateAccount } from "@/lib/services/accounts";
import { updateAccountSchema } from "@/lib/validation/account";

// Reads the session cookie via requireSession() on every call, so this
// route can never be statically rendered — declaring it explicitly stops
// Next.js from probing (and logging) that during build.
export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export const GET = withErrorHandling(async (_request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  const account = await getAccount(session.userId, params.id);
  return NextResponse.json({ account });
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  const body = await request.json();
  const input = updateAccountSchema.parse(body);
  const account = await updateAccount(session.userId, params.id, input);
  return NextResponse.json({ account });
});

export const DELETE = withErrorHandling(async (_request: NextRequest, { params }: Params) => {
  const session = await requireSession();
  await deleteAccount(session.userId, params.id);
  return NextResponse.json({ ok: true });
});
