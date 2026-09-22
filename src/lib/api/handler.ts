import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/lib/domain/rules";
import { UnauthorizedError } from "@/lib/auth/session";

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Wraps a route handler so every API route gets the same error shape and
 * status codes, instead of re-implementing try/catch in every file.
 * Domain and validation errors become 4xx with a message; anything else
 * is logged and returned as a generic 500 (never leaks internals).
 */
export function withErrorHandling<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid request", issues: err.flatten() },
          { status: 400 },
        );
      }
      if (err instanceof DomainError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      if (err instanceof NotFoundError) {
        return NextResponse.json({ error: err.message }, { status: 404 });
      }
      if (err instanceof ConflictError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      console.error(err);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}
