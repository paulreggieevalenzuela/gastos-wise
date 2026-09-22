import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { verifyEmail } from "@/lib/services/auth";
import { verifyEmailSchema } from "@/lib/validation/auth";

// POST rather than GET: the token is consumed here, and a GET link left
// alone would let email-security scanners (Outlook Safe Links and
// similar) silently pre-fetch and burn one-time confirmation links. The
// emailed link instead opens /verify-email, a page that calls this route.
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { token } = verifyEmailSchema.parse(body);

  const result = await verifyEmail(token);
  if (result.status === "invalid") {
    return NextResponse.json(
      { error: "This confirmation link is invalid or has expired." },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: "Email confirmed. You can now sign in." });
});
