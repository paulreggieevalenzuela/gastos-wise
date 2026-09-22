import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "expense_tracker_session";

// Pages an already-signed-in visitor should be bounced off of (to /dashboard).
const GUEST_ONLY_PATHS = ["/login", "/register", "/forgot-password"];

const PUBLIC_PATHS = [
  ...GUEST_ONLY_PATHS,
  "/verify-email",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify-email",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/resend-verification",
];

function getSecretKey() {
  const secret = process.env.AUTH_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isStatic = pathname.startsWith("/_next") || pathname.startsWith("/favicon");

  if (isStatic) {
    return NextResponse.next();
  }

  const authed = await hasValidSession(request);

  const isGuestOnly = GUEST_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (authed && isGuestOnly) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPublic) {
    return NextResponse.next();
  }

  if (!authed && !pathname.startsWith("/api")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!authed && pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
