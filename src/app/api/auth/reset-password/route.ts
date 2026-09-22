import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { resetPassword } from "@/lib/services/auth";
import { resetPasswordSchema } from "@/lib/validation/auth";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { token, password } = resetPasswordSchema.parse(body);

  const result = await resetPassword(token, password);
  if (result.status === "invalid") {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: "Password updated. You can now sign in." });
});
