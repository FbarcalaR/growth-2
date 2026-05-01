import { z } from "zod";

import { AREA_KEYS } from "@/shared/areas";
import { HEALTH_STATES } from "@/shared/health";
import { RESOURCE_KEYS } from "@/shared/resources";

const PlantIdSchema = z.enum([
  "herb",
  "sunflower",
  "money_tree",
  "rose",
  "mushroom",
  "crystal",
  "moon_flower",
]);

const StageSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

const ResourceSchema = z.enum(RESOURCE_KEYS);
const ResourceCostSchema = z.partialRecord(ResourceSchema, z.number().int().min(0));
const AreaSchema = z.enum(AREA_KEYS);
const HealthStateSchema = z.enum(HEALTH_STATES);
const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const TaskDtoSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  completed: z.boolean(),
  dueDate: ISODateSchema.nullable(),
});

export type TaskDto = z.infer<typeof TaskDtoSchema>;

export const RoutineDtoSchema = z.object({
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

export type RoutineDto = z.infer<typeof RoutineDtoSchema>;

/**
 * Wire shape of a Goal. Includes the server-derived `health` and `healthState`
 * — the client never re-derives these.
 */
export const GoalDtoSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  area: AreaSchema,
  plantType: PlantIdSchema,
  stage: StageSchema,
  plantRes: ResourceCostSchema,
  planted: z.boolean(),
  tileCol: z.number().int().min(0).max(7).nullable(),
  tileRow: z.number().int().min(0).max(5).nullable(),
  tasks: z.array(TaskDtoSchema),
  routines: z.array(RoutineDtoSchema),
  completed: z.boolean().optional(),
  completedAt: z.number().optional(),
  trophyId: z.string().optional(),
  health: z.number().min(0).max(100),
  healthState: HealthStateSchema,
});

export type GoalDto = z.infer<typeof GoalDtoSchema>;

export const CreateGoalRequestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  area: AreaSchema,
  plantType: PlantIdSchema.optional(),
});
export type CreateGoalRequest = z.infer<typeof CreateGoalRequestSchema>;

export const UpdateGoalRequestSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    area: AreaSchema.optional(),
    plantType: PlantIdSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required");
export type UpdateGoalRequest = z.infer<typeof UpdateGoalRequestSchema>;

export const CreateTaskRequestSchema = z.object({
  title: z.string().trim().min(1).max(160),
  dueDate: ISODateSchema.nullable().optional(),
});
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

export const UpdateTaskRequestSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    dueDate: ISODateSchema.nullable().optional(),
    completed: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required");
export type UpdateTaskRequest = z.infer<typeof UpdateTaskRequestSchema>;

export const CreateRoutineRequestSchema = z.object({
  title: z.string().trim().min(1).max(160),
  repeatDays: z
    .tuple([
      z.boolean(),
      z.boolean(),
      z.boolean(),
      z.boolean(),
      z.boolean(),
      z.boolean(),
      z.boolean(),
    ])
    .refine((d) => d.some(Boolean), "At least one day must be selected"),
});
export type CreateRoutineRequest = z.infer<typeof CreateRoutineRequestSchema>;

export const UpdateRoutineRequestSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    repeatDays: z
      .tuple([
        z.boolean(),
        z.boolean(),
        z.boolean(),
        z.boolean(),
        z.boolean(),
        z.boolean(),
        z.boolean(),
      ])
      .optional(),
    completedToday: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "At least one field is required");
export type UpdateRoutineRequest = z.infer<typeof UpdateRoutineRequestSchema>;
