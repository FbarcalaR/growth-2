import { z } from "zod";

import { AREA_KEYS } from "@/shared/areas";
import { RESOURCE_KEYS } from "@/shared/resources";

import { GARDEN_COLS, GARDEN_ROWS } from "./types";

const PlantIdSchema = z.enum([
  "herb",
  "sunflower",
  "money_tree",
  "rose",
  "mushroom",
  "crystal",
  "moon_flower",
]);

const ResourceSchema = z.enum(RESOURCE_KEYS);
const AreaSchema = z.enum(AREA_KEYS);
const StageSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

const ResourceCostSchema = z.partialRecord(ResourceSchema, z.number().int().min(0));

const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean(),
  dueDate: ISODateSchema.nullable(),
});

export const RoutineSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completedToday: z.boolean(),
  streak: z.number().int().min(0),
  repeatDays: z.tuple([
    z.boolean(),
    z.boolean(),
    z.boolean(),
    z.boolean(),
    z.boolean(),
    z.boolean(),
    z.boolean(),
  ]),
  permanentlyCompleted: z.boolean().optional(),
});

export const GoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1),
  area: AreaSchema,
  plantType: PlantIdSchema,
  stage: StageSchema,
  plantRes: ResourceCostSchema,
  planted: z.boolean(),
  tileCol: z
    .number()
    .int()
    .min(0)
    .max(GARDEN_COLS - 1)
    .nullable(),
  tileRow: z
    .number()
    .int()
    .min(0)
    .max(GARDEN_ROWS - 1)
    .nullable(),
  tasks: z.array(TaskSchema),
  routines: z.array(RoutineSchema),
  completed: z.boolean().optional(),
  completedAt: z.number().optional(),
  trophyId: z.string().optional(),
});

export const WheelOfLifeSchema = z.object({
  health: z.number().int().min(0),
  career: z.number().int().min(0),
  finances: z.number().int().min(0),
  relationships: z.number().int().min(0),
  personal: z.number().int().min(0),
  fun: z.number().int().min(0),
  spirituality: z.number().int().min(0),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.number(),
  shopCoins: z.number().int().min(0),
  totalCoinsEarned: z.number().int().min(0),
  streak: z.number().int().min(0),
  wheelOfLife: WheelOfLifeSchema,
  prioritiesLocked: z.boolean(),
});

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
