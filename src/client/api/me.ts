import { ExportPayloadSchema, type ExportPayload } from "@/shared/schemas/export";
import {
  CreateSessionRequestSchema,
  LockPrioritiesRequestSchema,
  UpdateUserRequestSchema,
  UserDtoSchema,
  type CreateSessionRequest,
  type LockPrioritiesRequest,
  type UpdateUserRequest,
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

  exportState: (signal?: AbortSignal) =>
    apiFetch<ExportPayload>("/api/me/export", ExportPayloadSchema, { signal }),

  importState: (payload: ExportPayload) =>
    apiFetch<UserDto>("/api/me/import", UserDtoSchema, {
      method: "POST",
      body: ExportPayloadSchema.parse(payload),
    }),
};
