import type { z } from "zod";

import { HttpError } from "./error-mapper";

/**
 * Parse a request's JSON body against a Zod schema. Throws an `HttpError`
 * with code `INVALID_INPUT` (422) on validation or parse failure — the error
 * mapper turns it into a stable JSON response.
 */
export async function parseBody<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(422, "INVALID_INPUT", "Body must be JSON");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new HttpError(
      422,
      "INVALID_INPUT",
      "Invalid request body",
      result.error.issues.map((i) => ({
        path: i.path.map(String),
        message: i.message,
      })),
    );
  }
  return result.data;
}

/** Validate a freshly-built response payload against its schema (defensive — runs in dev only). */
export function assertResponse<T>(schema: z.ZodType<T>, value: T): T {
  if (process.env.NODE_ENV === "production") return value;
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    console.error("[api] response failed schema check", parsed.error);
  }
  return value;
}
