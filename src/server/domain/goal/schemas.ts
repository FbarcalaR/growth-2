import { z } from "zod";

import { AREA_KEYS } from "@/shared/areas";

import { GARDEN_COLS, GARDEN_ROWS } from "../garden/types";
import { PlantIdSchema, ResourceCostSchema, StageSchema } from "../plant/schemas";

const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const AreaSchema = z.enum(AREA_KEYS);

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
