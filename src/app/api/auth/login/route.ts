import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { createSession } from "@/lib/auth/session";
import { authenticateUser } from "@/lib/services/auth";
import { loginSchema } from "@/lib/validation/auth";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { email, password } = loginSchema.parse(body);

  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }

  await createSession({ userId: user.id, email: user.email, name: user.name });

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, currency: user.currency },
  });
});
