import { POST as createSession } from "@/app/api/me/route";

import type { UserDto } from "@/shared/schemas/user";

import { jsonRequest } from "./test-context";

/**
 * Sign in (or sign up) a test user via the real `/api/me` POST handler — that
 * way the cookie is set the same way it will be in production. Returns the
 * created/found user DTO.
 */
export async function signIn(name: string): Promise<UserDto> {
  const res = await createSession(jsonRequest("POST", { name }));
  if (res.status !== 201) {
    throw new Error(`signIn(${name}) failed: HTTP ${res.status}`);
  }
  return (await res.json()) as UserDto;
}
