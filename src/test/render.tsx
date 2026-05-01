import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * RTL `render` wrapped in a fresh `QueryClient`. Defaults match production:
 * Zod-parsed responses, no retries on 4xx, no refetch-on-focus (deterministic
 * tests). Each call gets its own client so caches don't leak between tests.
 *
 * ```ts
 * const { getByText } = renderWithQuery(<LoginPage />);
 * ```
 *
 * Pass `{ client }` if a test needs to seed the cache or inspect it directly.
 */
export type RenderWithQueryOptions = Omit<RenderOptions, "wrapper"> & {
  client?: QueryClient;
};

export function renderWithQuery(
  ui: ReactElement,
  options: RenderWithQueryOptions = {},
): RenderResult & { client: QueryClient } {
  const { client = createTestQueryClient(), ...rest } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  const result = render(ui, { wrapper: Wrapper, ...rest });
  return { ...result, client };
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}
