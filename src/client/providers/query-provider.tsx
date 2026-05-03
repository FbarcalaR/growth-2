"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError } from "@/client/api";
import { toast } from "@/client/hooks";

/**
 * App-wide TanStack Query provider. The QueryClient lives in component state
 * so each browser tab gets a fresh cache (and StrictMode double-invocation
 * doesn't reset between renders).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    // Centralised mutation-error handling (Story 8.2). Per-mutation `onError`
    // handlers still run alongside this — the cache hook fires *after* the
    // local handler, so optimistic-rollback logic (e.g. `use-today-toggles`)
    // still repairs the cache before the toast pops.
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(humanizeError(error));
      },
    }),
    defaultOptions: {
      queries: {
        // The HTTP boundary is fast (in-memory) and the in-flight token
        // refetch on focus is appropriate once we have a real backend.
        staleTime: 30_000,
        retry: (failureCount, error) => {
          // Don't retry 4xx — they won't get better.
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** Map an arbitrary thrown value into something the user can read. */
function humanizeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Please sign in again.";
    if (error.status === 403) return "You don't have permission to do that.";
    if (error.status >= 500) return "The server hit an error — try again in a moment.";
    return error.message || "Something went wrong.";
  }
  if (error instanceof Error) return error.message || "Something went wrong.";
  return "Something went wrong.";
}
