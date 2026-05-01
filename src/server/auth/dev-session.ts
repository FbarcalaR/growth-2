import { cookies } from "next/headers";

const COOKIE_NAME = "growth_dev_user";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  // Production would set `secure`; left off in dev so the cookie works over http://localhost.
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

/**
 * Dev-only cookie session. Stores a userId in an HttpOnly cookie. Replaced by
 * Auth.js in Epic B — `requireUser` switches to reading the Auth.js session
 * subject and the rest of the server code doesn't change.
 */

export async function getDevSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function setDevSessionUserId(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, userId, COOKIE_OPTS);
}

export async function clearDevSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
