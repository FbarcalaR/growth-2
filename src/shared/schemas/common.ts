import { z } from "zod";

/** Stable error codes returned in 4xx/5xx response bodies. Mirrors `DomainErrorCode`. */
export const ApiErrorCodeSchema = z.enum([
  "GOAL_NOT_FOUND",
  "TASK_NOT_FOUND",
  "ROUTINE_NOT_FOUND",
  "TILE_OUT_OF_BOUNDS",
  "TILE_OCCUPIED",
  "GOAL_ALREADY_PLANTED",
  "GOAL_ALREADY_COMPLETED",
  "GOAL_NOT_PLANTED",
  "INSUFFICIENT_COINS",
  "DECO_NOT_OWNED",
  "DECO_ALREADY_OWNED",
  "PRIORITIES_ALREADY_LOCKED",
  "INVALID_INPUT",
  "UNAUTHORIZED",
  "INTERNAL",
]);

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const ApiErrorResponseSchema = z.object({
  code: ApiErrorCodeSchema,
  message: z.string(),
  /** Optional structured details (e.g. Zod error issues for INVALID_INPUT). */
  issues: z.array(z.object({ path: z.array(z.string()), message: z.string() })).optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
