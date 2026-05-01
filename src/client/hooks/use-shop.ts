"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { shopApi } from "@/client/api";
import type { DecoItemDto, BuyDecoRequest } from "@/shared/schemas/shop";

import { queryKeys } from "./query-keys";

export function useShop() {
  return useQuery<DecoItemDto[]>({
    queryKey: queryKeys.shop(),
    queryFn: ({ signal }) => shopApi.list(signal),
    // Catalog rarely changes — cache for the lifetime of the session.
    staleTime: 60 * 60_000,
  });
}

export function useBuyDeco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BuyDecoRequest) => shopApi.buy(input),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.me(), user);
      qc.invalidateQueries({ queryKey: queryKeys.garden() });
    },
  });
}
