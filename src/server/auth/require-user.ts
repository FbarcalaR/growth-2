import "server-only";

import { getContainer } from "../container";
import type { User } from "../domain/user/types";
import { unauthorized } from "../http/error-mapper";

import { getDevSessionUserId } from "./dev-session";

/**
 * Resolve the authenticated user for a request. Today reads the dev-session
 * cookie; tomorrow returns the Auth.js session subject. Route Handlers don't
 * change when we swap the implementation.
 *
 * Throws `HttpError` (401) when no session is present or the session points
 * at a deleted user.
 */
export async function requireUser(): Promise<User> {
  const userId = await getDevSessionUserId();
  if (!userId) throw unauthorized();

  const { repos } = getContainer();
  const user = await repos.users.findById(userId);
  if (!user) throw unauthorized("Session user no longer exists");
  return user;
}
