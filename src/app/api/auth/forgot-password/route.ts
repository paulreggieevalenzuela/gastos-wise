import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requestPasswordReset } from "@/lib/services/auth";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { email } = forgotPasswordSchema.parse(body);

  await requestPasswordReset(email);

  // Same response whether or not the address is registered — otherwise
  // this endpoint could be used to check who has an account.
  return NextResponse.json({
    message: "If an account exists for that email, we've sent password reset instructions.",
  });
});
