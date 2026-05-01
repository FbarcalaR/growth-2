import { NextResponse } from "next/server";

import { DomainError, type DomainErrorCode } from "../domain/errors";
import type { ApiErrorCode, ApiErrorResponse } from "@/shared/schemas/common";

const STATUS_BY_CODE: Record<DomainErrorCode | "UNAUTHORIZED" | "INTERNAL", number> = {
  GOAL_NOT_FOUND: 404,
  TASK_NOT_FOUND: 404,
  ROUTINE_NOT_FOUND: 404,
  DECO_NOT_OWNED: 404,
  TILE_OUT_OF_BOUNDS: 422,
  INVALID_INPUT: 422,
  TILE_OCCUPIED: 409,
  GOAL_ALREADY_PLANTED: 409,
  GOAL_ALREADY_COMPLETED: 409,
  GOAL_NOT_PLANTED: 409,
  DECO_ALREADY_OWNED: 409,
  PRIORITIES_ALREADY_LOCKED: 409,
  INSUFFICIENT_COINS: 402,
  UNAUTHORIZED: 401,
  INTERNAL: 500,
};

export class HttpError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly issues?: ApiErrorResponse["issues"];

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    issues?: ApiErrorResponse["issues"],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

export function unauthorized(message = "Sign in required"): HttpError {
  return new HttpError(STATUS_BY_CODE.UNAUTHORIZED, "UNAUTHORIZED", message);
}

/**
 * Translate any thrown error into a JSON Response with a stable shape. Domain
 * errors map to known status codes; anything else is logged and returned as
 * 500 with no leak of internal details.
 */
export function toErrorResponse(err: unknown): NextResponse<ApiErrorResponse> {
  if (err instanceof HttpError) {
    return NextResponse.json<ApiErrorResponse>(
      { code: err.code, message: err.message, issues: err.issues },
      { status: err.status },
    );
  }
  if (err instanceof DomainError) {
    const status = STATUS_BY_CODE[err.code] ?? 500;
    return NextResponse.json<ApiErrorResponse>(
      { code: err.code, message: err.message },
      { status },
    );
  }
  // Unknown — don't leak internals.
  console.error("[api] unhandled error", err);
  return NextResponse.json<ApiErrorResponse>(
    { code: "INTERNAL", message: "Something went wrong" },
    { status: 500 },
  );
}

/**
 * Wraps a handler so any thrown DomainError / HttpError / unknown becomes the
 * canonical JSON error response. Use this for every Route Handler.
 */
export function withErrorMapping<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}
