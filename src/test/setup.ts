import { vi } from "vitest";

/**
 * Test-only stand-in for the Next.js `cookies()` request store. Module-level
 * so `vi.mock` is hoisted before any route-handler import in the test files.
 * Tests drive the auth state through this store via the `cookies-mock`
 * helper module.
 */

class TestCookieStore {
  private store = new Map<string, string>();

  get(name: string): { value: string } | undefined {
    const value = this.store.get(name);
    return value === undefined ? undefined : { value };
  }

  set(name: string, value: string): void {
    this.store.set(name, value);
  }

  delete(name: string): void {
    this.store.delete(name);
  }

  clear(): void {
    this.store.clear();
  }
}

const store = new TestCookieStore();

// Exposed globally so the test helpers can clear it between cases without
// a brittle import path.
declare global {
  var __TEST_COOKIE_STORE__: TestCookieStore;
}
globalThis.__TEST_COOKIE_STORE__ = store;

vi.mock("next/headers", () => ({
  cookies: async () => store,
}));
