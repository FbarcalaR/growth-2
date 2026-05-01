import {
  CreateSessionRequestSchema,
  LockPrioritiesRequestSchema,
  UserDtoSchema,
  type CreateSessionRequest,
  type LockPrioritiesRequest,
  type UserDto,
} from "@/shared/schemas/user";

import { apiFetch, apiFetchVoid } from "./client";

export const meApi = {
  get: (signal?: AbortSignal) => apiFetch<UserDto>("/api/me", UserDtoSchema, { signal }),

  createSession: (input: CreateSessionRequest) =>
    apiFetch<UserDto>("/api/me", UserDtoSchema, {
      method: "POST",
      body: CreateSessionRequestSchema.parse(input),
    }),

  signOut: () => apiFetchVoid("/api/me", { method: "DELETE" }),

  lockPriorities: (input: LockPrioritiesRequest) =>
    apiFetch<UserDto>("/api/me/priorities", UserDtoSchema, {
      method: "PATCH",
      body: LockPrioritiesRequestSchema.parse(input),
    }),
};
