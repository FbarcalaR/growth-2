"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { meApi } from "@/client/api";
import type { UserDto } from "@/shared/schemas/user";

import { queryKeys } from "./query-keys";

/**
 * Reset everything the user owns (goals, garden, completion log) and zero
 * the wallet/streak/wheel/priorities-locked flag. Powers the Profile-tab
 * reset button. Every cached entity downstream gets invalidated so the rest
 * of the app sees the fresh server state on the next read.
 */
export function useResetData() {
  const qc = useQueryClient();
  return useMutation<UserDto>({
    mutationFn: () => meApi.reset(),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.me(), user);
      qc.invalidateQueries({ queryKey: queryKeys.goals(), exact: false });
      qc.invalidateQueries({ queryKey: queryKeys.garden(), exact: false });
      qc.invalidateQueries({ queryKey: queryKeys.today() });
      qc.invalidateQueries({ queryKey: ["history"], exact: false });
    },
  });
}
