import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/services/auth";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
      themeMode: user.themeMode,
      accentColor: user.accentColor,
    },
  });
});
