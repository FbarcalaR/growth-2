import { z } from "zod";

const TileCoordsSchema = z.object({
  col: z.number().int().min(0).max(7),
  row: z.number().int().min(0).max(5),
});

export const GardenTileDtoSchema = z.union([
  z.object({ kind: z.literal("plant"), goalId: z.string() }),
  z.object({ kind: z.literal("deco"), itemId: z.string() }),
  z.null(),
]);

export type GardenTileDto = z.infer<typeof GardenTileDtoSchema>;

export const GardenDtoSchema = z.object({
  decoGrid: z.array(z.array(GardenTileDtoSchema).length(6)).length(8),
  owned: z.array(z.string()),
});

export type GardenDto = z.infer<typeof GardenDtoSchema>;

export const PlantOnTileRequestSchema = TileCoordsSchema.extend({
  goalId: z.string().min(1),
});
export type PlantOnTileRequest = z.infer<typeof PlantOnTileRequestSchema>;

export const PlaceDecoRequestSchema = TileCoordsSchema.extend({
  itemId: z.string().min(1),
});
export type PlaceDecoRequest = z.infer<typeof PlaceDecoRequestSchema>;

export const TileCoordsRequestSchema = TileCoordsSchema;
export type TileCoordsRequest = z.infer<typeof TileCoordsRequestSchema>;
