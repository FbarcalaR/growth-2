"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, meApi } from "@/client/api";
import type { UserDto, WheelOfLifeDto } from "@/shared/schemas/user";

import { queryKeys } from "./query-keys";

/**
 * The single source of truth for "who is signed in". Replaces the temporary
 * `useDevSession` localStorage hook from PR 4. Same return shape — call sites
 * stay the same when Auth.js lands later.
 */

type SessionState = {
  /** The signed-in user, or `null` when unauthenticated. */
  user: UserDto | null;
  /** True while the initial `/api/me` request is in flight. */
  isLoading: boolean;
  /** Convenience derived from `user.prioritiesLocked`. */
  prioritiesLocked: boolean;
};

export function useSession(): SessionState & {
  login: (name: string) => Promise<UserDto>;
  logout: () => Promise<void>;
  lockPriorities: (values: WheelOfLifeDto) => Promise<UserDto>;
} {
  const qc = useQueryClient();

  const query = useQuery<UserDto | null>({
    queryKey: queryKeys.me(),
    queryFn: async ({ signal }) => {
      try {
        return await meApi.get(signal);
      } catch (err) {
        // Treat 401 as "no session", not an error state.
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    // Auth state shouldn't go stale on its own.
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: (name: string) => meApi.createSession({ name }),
    onSuccess: (user) => qc.setQueryData(queryKeys.me(), user),
  });

  const logoutMutation = useMutation({
    mutationFn: () => meApi.signOut(),
    onSuccess: () => {
      qc.setQueryData(queryKeys.me(), null);
      qc.removeQueries({ queryKey: queryKeys.goals(), exact: false });
      qc.removeQueries({ queryKey: queryKeys.garden(), exact: false });
    },
  });

  const lockMutation = useMutation({
    mutationFn: (values: WheelOfLifeDto) => meApi.lockPriorities({ values }),
    onSuccess: (user) => qc.setQueryData(queryKeys.me(), user),
  });

  return {
    user: query.data ?? null,
    isLoading: query.isPending,
    prioritiesLocked: query.data?.prioritiesLocked ?? false,
    login: (name: string) => loginMutation.mutateAsync(name),
    logout: () => logoutMutation.mutateAsync(),
    lockPriorities: (values: WheelOfLifeDto) => lockMutation.mutateAsync(values),
  };
}
