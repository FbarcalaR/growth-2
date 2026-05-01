"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ApiError } from "@/client/api";

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
