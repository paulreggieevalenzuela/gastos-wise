import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { destroySession } from "@/lib/auth/session";

export const POST = withErrorHandling(async () => {
  destroySession();
  return NextResponse.json({ ok: true });
});
