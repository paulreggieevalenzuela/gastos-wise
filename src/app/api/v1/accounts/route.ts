import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { createAccount, listAccounts } from "@/lib/services/accounts";
import { createAccountSchema } from "@/lib/validation/account";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const includeInactive = request.nextUrl.searchParams.get("includeInactive") === "true";
  const accounts = await listAccounts(session.userId, includeInactive);
  return NextResponse.json({ accounts });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const body = await request.json();
  const input = createAccountSchema.parse(body);
  const account = await createAccount(session.userId, input);
  return NextResponse.json({ account }, { status: 201 });
});
