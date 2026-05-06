"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signIn, signOut } from "next-auth/react";

import { ApiError, meApi } from "@/client/api";
import type { UserDto, WheelOfLifeDto } from "@/shared/schemas/user";

import { queryKeys } from "./query-keys";

/**
 * The single source of truth for "who is signed in". Wraps `/api/me`
 * (which itself reads the Auth.js session via `requireUser()`) so the
 * client gets the full domain User including `wheelOfLife` /
 * `prioritiesLocked` / wallet — fields Auth.js's own session doesn't
 * carry. The Auth.js session lives alongside via `<SessionProvider>` in
 * the root layout; we don't read it here directly.
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
  /** Kick off Google OAuth → callback → `/today`. */
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<UserDto>;
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

  const lockMutation = useMutation({
    mutationFn: (values: WheelOfLifeDto) => meApi.lockPriorities({ values }),
    onSuccess: (user) => qc.setQueryData(queryKeys.me(), user),
  });

  const renameMutation = useMutation({
    mutationFn: (name: string) => meApi.updateName({ name }),
    onSuccess: (user) => qc.setQueryData(queryKeys.me(), user),
  });

  return {
    user: query.data ?? null,
    isLoading: query.isPending,
    prioritiesLocked: query.data?.prioritiesLocked ?? false,
    signInWithGoogle: () => signIn("google", { callbackUrl: "/today" }).then(() => undefined),
    logout: async () => {
      // Clear the React Query caches *before* Auth.js redirects, otherwise
      // the destination page renders with stale data for a frame.
      qc.setQueryData(queryKeys.me(), null);
      qc.removeQueries({ queryKey: queryKeys.goals(), exact: false });
      qc.removeQueries({ queryKey: queryKeys.garden(), exact: false });
      await signOut({ callbackUrl: "/login" });
    },
    updateName: (name: string) => renameMutation.mutateAsync(name),
    lockPriorities: (values: WheelOfLifeDto) => lockMutation.mutateAsync(values),
  };
}
