import { z } from "zod";

import { AREA_KEYS } from "@/shared/areas";
import { HEALTH_STATES } from "@/shared/health";
import { PLANT_IDS } from "@/shared/plants";

import { RoutineDtoSchema, TaskDtoSchema } from "./goal";

const PlantIdSchema = z.enum(PLANT_IDS);

const StageSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

/**
 * One Today group: a goal whose tasks/routines have something visible today.
 * The goal carries enough surface metadata to render the group header without
 * a second round-trip; per-row stage progress and resources stay on
 * `GoalDto` (use `useGoal(id)` if a row needs them).
 */
export const TodayGroupDtoSchema = z.object({
  goalId: z.string(),
  goalTitle: z.string(),
  goalArea: z.enum(AREA_KEYS),
  goalPlantType: PlantIdSchema,
  goalStage: StageSchema,
  goalHealth: z.number().min(0).max(100),
  goalHealthState: z.enum(HEALTH_STATES),
  tasks: z.array(TaskDtoSchema),
  routines: z.array(RoutineDtoSchema),
});

export type TodayGroupDto = z.infer<typeof TodayGroupDtoSchema>;

export const TodayResponseSchema = z.object({
  groups: z.array(TodayGroupDtoSchema),
});

export type TodayResponse = z.infer<typeof TodayResponseSchema>;
