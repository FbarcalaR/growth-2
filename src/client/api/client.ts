import type { z } from "zod";

import { ApiErrorResponseSchema } from "@/shared/schemas/common";

import { ApiError } from "./api-error";

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * Fetch a JSON endpoint and parse the response through a Zod schema.
 *
 * - 2xx responses are validated against `responseSchema` and returned typed.
 *   Schema mismatches throw — the contract is the source of truth.
 * - Non-2xx responses are decoded into an `ApiError` with the server's
 *   stable `{ code, message }`.
 * - Use `apiFetchVoid` for 204 No Content responses.
 */
export async function apiFetch<T>(
  url: string,
  responseSchema: z.ZodType<T>,
  options: FetchOptions = {},
): Promise<T> {
  const res = await rawFetch(url, options);
  if (!res.ok) throw await toApiError(res);
  const json = (await res.json()) as unknown;
  const parsed = responseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Response from ${url} failed schema check: ${parsed.error.message}`);
  }
  return parsed.data;
}

/** Variant for endpoints that return 204 No Content (or where we don't care about the body). */
export async function apiFetchVoid(url: string, options: FetchOptions = {}): Promise<void> {
  const res = await rawFetch(url, options);
  if (!res.ok) throw await toApiError(res);
}

async function rawFetch(
  url: string,
  { method = "GET", body, signal }: FetchOptions,
): Promise<Response> {
  return fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    signal,
  });
}

async function toApiError(res: Response): Promise<ApiError> {
  let errorBody: unknown;
  try {
    errorBody = await res.json();
  } catch {
    errorBody = { code: "INTERNAL", message: res.statusText || "Request failed" };
  }
  const parsed = ApiErrorResponseSchema.safeParse(errorBody);
  if (parsed.success) return new ApiError(res.status, parsed.data);
  return new ApiError(res.status, { code: "INTERNAL", message: "Request failed" });
}
