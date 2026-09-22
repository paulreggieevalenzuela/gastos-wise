import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { resendVerificationEmail } from "@/lib/services/auth";
import { resendVerificationSchema } from "@/lib/validation/auth";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { identifier } = resendVerificationSchema.parse(body);

  await resendVerificationEmail(identifier);

  // Same response whether or not the account exists / is already
  // verified — avoids leaking account state to an unauthenticated caller.
  return NextResponse.json({
    message: "If that account exists and isn't confirmed yet, we've sent a new confirmation email.",
  });
});
