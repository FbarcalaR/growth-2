import { vi, type Mock } from "vitest";

/**
 * Tiny fetch mock for client-side tests. Register URL→response mappings
 * before mounting the component; assert on call shape after.
 *
 * ```ts
 * const fetch = setupFetchMock();
 * fetch.mock("/api/me", { status: 200, body: user });
 * fetch.mock("/api/goals", { status: 200, body: { goals: [g1] } });
 * // ... mount component, run interactions
 * expect(fetch.calls("POST", "/api/me")).toHaveLength(1);
 * ```
 *
 * `setupFetchMock` installs the global mock and returns a controller. Call
 * `controller.restore()` from `afterEach` (or rely on `vi.unstubAllGlobals`).
 */

type MockResponse = {
  status?: number;
  body?: unknown;
  /** Optional matcher for HTTP method. Defaults to any. */
  method?: string;
};

type Mapping = { url: string | RegExp } & MockResponse;

export type FetchMock = {
  /** The underlying spy. */
  spy: Mock;
  /** Add or override a mapping. Last-wins for duplicates. */
  mock(url: string | RegExp, response: MockResponse): void;
  /** Convenience: status 200 + JSON body. */
  json(url: string | RegExp, body: unknown, method?: string): void;
  /** All calls matching a method+url filter (string is exact-match). */
  calls(method?: string, url?: string): Array<{ url: string; method: string; body: unknown }>;
  /** Reset all registered mappings. */
  reset(): void;
  /** Remove the global stub. */
  restore(): void;
};

export function setupFetchMock(initial: Record<string, unknown> = {}): FetchMock {
  const mappings: Mapping[] = [];

  const spy = vi.fn(async (input: string | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method ?? "GET").toUpperCase();
    const match = [...mappings].reverse().find((m) => {
      if (m.method && m.method.toUpperCase() !== method) return false;
      return typeof m.url === "string" ? m.url === url : m.url.test(url);
    });
    if (!match) {
      throw new Error(`fetch-mock: no mapping for ${method} ${url}`);
    }
    const status = match.status ?? 200;
    const body = match.body ?? null;
    return new Response(body === null ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });

  vi.stubGlobal("fetch", spy);

  for (const [url, body] of Object.entries(initial)) {
    mappings.push({ url, status: 200, body });
  }

  return {
    spy,
    mock(url, response) {
      mappings.push({ url, ...response });
    },
    json(url, body, method) {
      mappings.push({ url, body, status: 200, method });
    },
    calls(method, url) {
      return spy.mock.calls
        .map((args) => {
          const [input, init] = args as [string | URL, RequestInit | undefined];
          const u = typeof input === "string" ? input : input.toString();
          const m = (init?.method ?? "GET").toUpperCase();
          let body: unknown = undefined;
          if (init?.body && typeof init.body === "string") {
            try {
              body = JSON.parse(init.body);
            } catch {
              body = init.body;
            }
          }
          return { url: u, method: m, body };
        })
        .filter((c) => (method ? c.method === method.toUpperCase() : true))
        .filter((c) => (url ? c.url === url : true));
    },
    reset() {
      mappings.length = 0;
      spy.mockClear();
    },
    restore() {
      vi.unstubAllGlobals();
    },
  };
}
