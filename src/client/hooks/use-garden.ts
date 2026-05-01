"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { gardenApi } from "@/client/api";
import type {
  GardenDto,
  PlaceDecoRequest,
  PlantOnTileRequest,
  TileCoordsRequest,
} from "@/shared/schemas/garden";

import { queryKeys } from "./query-keys";

export function useGarden() {
  return useQuery<GardenDto>({
    queryKey: queryKeys.garden(),
    queryFn: ({ signal }) => gardenApi.get(signal),
  });
}

export function usePlantOnTile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlantOnTileRequest) => gardenApi.plantOnTile(input),
    onSuccess: (garden) => {
      qc.setQueryData(queryKeys.garden(), garden);
      qc.invalidateQueries({ queryKey: queryKeys.goals() });
    },
  });
}

export function usePlaceDeco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceDecoRequest) => gardenApi.placeDeco(input),
    onSuccess: (garden) => qc.setQueryData(queryKeys.garden(), garden),
  });
}

export function useUnplaceDeco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TileCoordsRequest) => gardenApi.unplaceDeco(input),
    onSuccess: (garden) => qc.setQueryData(queryKeys.garden(), garden),
  });
}
