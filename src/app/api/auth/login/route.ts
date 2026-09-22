import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { createSession } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/services/auth";
import { loginSchema } from "@/lib/validation/auth";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { identifier, password } = loginSchema.parse(body);

  const result = await authenticateUser(identifier, password);

  if (result.status === "invalid_credentials") {
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  if (result.status === "unverified") {
    return NextResponse.json(
      { error: "Confirm your email before signing in.", code: "unverified" },
      { status: 403 },
    );
  }

  const { user } = result;
  await createSession({ userId: user.id, email: user.email, name: user.name });

  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email, name: user.name, currency: user.currency },
  });
});
