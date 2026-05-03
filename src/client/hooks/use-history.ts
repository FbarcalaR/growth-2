"use client";

import { useQuery } from "@tanstack/react-query";

import { historyApi } from "@/client/api";
import type { HistoryResponse } from "@/shared/schemas/history";

import { queryKeys } from "./query-keys";

export function useHistory(month: string) {
  return useQuery<HistoryResponse>({
    queryKey: queryKeys.history(month),
    queryFn: ({ signal }) => historyApi.get(month, signal),
  });
}
