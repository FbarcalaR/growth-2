// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSession } from "../use-session";

type FetchSpy = ReturnType<typeof vi.fn>;

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { client, Wrapper };
}

const validUser = {
  id: "u1",
  name: "Ada",
  createdAt: 0,
  shopCoins: 0,
  totalCoinsEarned: 0,
  streak: 0,
  wheelOfLife: {
    health: 0,
    career: 0,
    finances: 0,
    relationships: 0,
    personal: 0,
    fun: 0,
    spirituality: 0,
  },
  prioritiesLocked: false,
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchSpy: FetchSpy;

beforeEach(() => {
  fetchSpy = vi.fn();
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSession", () => {
  it("treats a 401 from /api/me as 'no user', not an error", async () => {
    fetchSpy.mockResolvedValueOnce(
      jsonResponse(401, { code: "UNAUTHORIZED", message: "Sign in required" }),
    );
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSession(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("returns the user when /api/me succeeds", async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(200, validUser));
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSession(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.user?.id).toBe("u1"));
    expect(result.current.prioritiesLocked).toBe(false);
  });

  it("login() POSTs to /api/me and writes the user into the cache", async () => {
    // Initial GET 401 → no user; then POST 201 with the new user.
    fetchSpy
      .mockResolvedValueOnce(
        jsonResponse(401, { code: "UNAUTHORIZED", message: "Sign in required" }),
      )
      .mockResolvedValueOnce(jsonResponse(201, validUser));

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSession(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(() => result.current.login("Ada"));
    await waitFor(() => expect(result.current.user?.name).toBe("Ada"));

    const calls = fetchSpy.mock.calls.map((c) => c[1]?.method ?? "GET");
    expect(calls).toEqual(["GET", "POST"]);
  });

  it("logout() DELETEs /api/me and clears the cached user", async () => {
    fetchSpy
      .mockResolvedValueOnce(jsonResponse(200, validUser))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSession(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe("u1"));

    await act(() => result.current.logout());
    await waitFor(() => expect(result.current.user).toBeNull());
  });
});
