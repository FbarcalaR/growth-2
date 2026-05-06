import {
  LockPrioritiesRequestSchema,
  UpdateUserRequestSchema,
  UserDtoSchema,
  type LockPrioritiesRequest,
  type UpdateUserRequest,
  type UserDto,
} from "@/shared/schemas/user";

import { apiFetch } from "./client";

/**
 * Client-side accessors for `/api/me`. Sign-in / sign-out went away in
 * Epic B — those flows now live on Auth.js (`signIn("google")` /
 * `signOut()`). This module only carries the post-auth domain mutations:
 * fetch the user, rename, lock priorities, reset all data.
 */
export const meApi = {
  get: (signal?: AbortSignal) => apiFetch<UserDto>("/api/me", UserDtoSchema, { signal }),

  updateName: (input: UpdateUserRequest) =>
    apiFetch<UserDto>("/api/me", UserDtoSchema, {
      method: "PATCH",
      body: UpdateUserRequestSchema.parse(input),
    }),

  lockPriorities: (input: LockPrioritiesRequest) =>
    apiFetch<UserDto>("/api/me/priorities", UserDtoSchema, {
      method: "PATCH",
      body: LockPrioritiesRequestSchema.parse(input),
    }),

  reset: () => apiFetch<UserDto>("/api/me/reset", UserDtoSchema, { method: "POST" }),
};
