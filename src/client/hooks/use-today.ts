"use client";

import { useQuery } from "@tanstack/react-query";

import { todayApi } from "@/client/api";
import type { TodayResponse } from "@/shared/schemas/today";

import { queryKeys } from "./query-keys";

export function useToday() {
  return useQuery<TodayResponse>({
    queryKey: queryKeys.today(),
    queryFn: ({ signal }) => todayApi.get(signal),
    // Today's items change as the clock moves; refetch on focus is enough.
  });
}
