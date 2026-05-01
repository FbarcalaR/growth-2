import type { ApiErrorCode, ApiErrorResponse } from "@/shared/schemas/common";

/**
 * Thrown by `apiFetch` for non-2xx responses. Mirrors the server-side `HttpError`
 * shape so the UI can branch on `error.code` without parsing strings.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly issues?: ApiErrorResponse["issues"];

  constructor(status: number, body: ApiErrorResponse) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.issues = body.issues;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
