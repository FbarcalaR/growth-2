import { z } from "zod";

import { RESOURCE_KEYS } from "@/shared/resources";

export const PlantIdSchema = z.enum([
  "herb",
  "sunflower",
  "money_tree",
  "rose",
  "mushroom",
  "crystal",
  "moon_flower",
]);

export const ResourceSchema = z.enum(RESOURCE_KEYS);

export const StageSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const ResourceCostSchema = z.partialRecord(ResourceSchema, z.number().int().min(0));
