import { resetContainer } from "../../container";

const cookieStore = globalThis.__TEST_COOKIE_STORE__;

/**
 * Reset the cached container and the cookie store. Call from `beforeEach` so
 * each test starts with a fresh in-memory backend and an unauthenticated
 * session.
 */
export function freshTestContext(): void {
  resetContainer();
  cookieStore.clear();
}

/** Drop the dev session for the current test. */
export function signOut(): void {
  cookieStore.delete("growth_dev_user");
}

/** Build a Request for a POST/PATCH/DELETE handler. */
export function jsonRequest(method: string, body?: unknown): Request {
  return new Request("http://localhost/test", {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

/** Build a Next.js dynamic route context with a Promise<params>. */
export function ctx<T extends Record<string, string>>(params: T): { params: Promise<T> } {
  return { params: Promise.resolve(params) };
}

export { cookieStore };
