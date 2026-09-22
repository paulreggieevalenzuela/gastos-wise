import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { NotFoundError, withErrorHandling } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { updateSettingsSchema } from "@/lib/validation/settings";

export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const session = await requireSession();
  const body = await request.json();
  const input = updateSettingsSchema.parse(body);

  const [updated] = await db
    .update(users)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(users.id, session.userId))
    .returning();

  if (!updated) throw new NotFoundError("User not found");

  return NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      currency: updated.currency,
      timezone: updated.timezone,
      themeMode: updated.themeMode,
      accentColor: updated.accentColor,
    },
  });
});
