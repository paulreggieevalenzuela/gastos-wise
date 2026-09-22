import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { registerUser } from "@/lib/services/auth";
import { registerSchema } from "@/lib/validation/auth";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const input = registerSchema.parse(body);

  await registerUser(input);

  return NextResponse.json(
    { message: "Account created. Check your email for a confirmation link before signing in." },
    { status: 201 },
  );
});
