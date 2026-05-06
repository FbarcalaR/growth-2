import "server-only";

import { getContainer } from "../container";
import type { User } from "../domain/user/types";
import { unauthorized } from "../http/error-mapper";

import { getDevSessionUserId } from "./dev-session";

/**
 * Resolve the authenticated user for a request. Reads the Auth.js JWT
 * session in production; falls back to the dev-stub cookie in test /
 * non-production environments so the unit-test harness keeps working
 * without spinning up an OAuth flow.
 *
 * Route Handlers don't change when the auth provider does — this helper
 * is the only place that knows about either path.
 *
 * Throws `HttpError` (401) when no session is present or the session
 * points at a deleted user.
 */
export async function requireUser(): Promise<User> {
  const userId = await resolveUserId();
  if (!userId) throw unauthorized();

  const { repos } = getContainer();
  const user = await repos.users.findById(userId);
  if (!user) throw unauthorized("Session user no longer exists");
  return user;
}

async function resolveUserId(): Promise<string | null> {
  // Test path — `freshTestContext()` stamps the dev-stub cookie and the unit
  // suites are oblivious to Auth.js. Bypass the import to keep `next-auth`
  // out of the test runner's import graph.
  if (process.env.NODE_ENV !== "production") {
    const devId = await getDevSessionUserId();
    if (devId) return devId;
  }

  // Production / preview path — read the Auth.js JWT session.
  try {
    // Lazy import: `@/auth` pulls in next-auth + the Prisma client. Loading
    // it only when we need the production lookup keeps the test harness
    // (which uses the in-memory store + dev-stub) from booting Prisma.
    const { auth } = await import("@/auth");
    const session = await auth();
    return session?.user?.id ?? null;
  } catch (err) {
    // If Auth.js mis-configures (missing env vars in dev) we don't want a
    // 500 — fall through to "no session".
    console.warn("[require-user] auth() threw:", err);
    return null;
  }
}
