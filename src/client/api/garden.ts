import {
  GardenDtoSchema,
  PlaceDecoRequestSchema,
  PlantOnTileRequestSchema,
  TileCoordsRequestSchema,
  type GardenDto,
  type PlaceDecoRequest,
  type PlantOnTileRequest,
  type TileCoordsRequest,
} from "@/shared/schemas/garden";

import { apiFetch } from "./client";

export const gardenApi = {
  get: (signal?: AbortSignal) => apiFetch<GardenDto>("/api/garden", GardenDtoSchema, { signal }),

  plantOnTile: (input: PlantOnTileRequest) =>
    apiFetch<GardenDto>("/api/garden/tiles", GardenDtoSchema, {
      method: "POST",
      body: PlantOnTileRequestSchema.parse(input),
    }),

  placeDeco: (input: PlaceDecoRequest) =>
    apiFetch<GardenDto>("/api/garden/decos", GardenDtoSchema, {
      method: "POST",
      body: PlaceDecoRequestSchema.parse(input),
    }),

  unplaceDeco: (input: TileCoordsRequest) =>
    apiFetch<GardenDto>("/api/garden/decos", GardenDtoSchema, {
      method: "DELETE",
      body: TileCoordsRequestSchema.parse(input),
    }),
};
