import { z } from "zod";

import { GARDEN_COLS, GARDEN_ROWS } from "./types";

export const GardenTileSchema = z.union([
  z.object({ kind: z.literal("plant"), goalId: z.string() }),
  z.object({ kind: z.literal("deco"), itemId: z.string() }),
  z.null(),
]);

export const GardenStateSchema = z.object({
  userId: z.string(),
  decoGrid: z.array(z.array(GardenTileSchema).length(GARDEN_ROWS)).length(GARDEN_COLS),
  owned: z.array(z.string()),
});

export const DecoItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number().int().min(0),
  emoji: z.string(),
});
