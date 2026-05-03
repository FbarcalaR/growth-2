import {
  countOverdueTasks,
  getGoalHealthState,
  getHealth,
  getOverdueCount,
} from "../../domain/health";
import type { TodayGroup } from "../today-service";
import type { TodayGroupDto } from "@/shared/schemas/today";

/**
 * Domain `TodayGroup` → wire `TodayGroupDto`. Flattens the goal metadata onto
 * the group so the client can render a header without unpacking a nested
 * `GoalDto`. Tasks and routines pass through unchanged — same shape as the
 * existing GoalDto's children.
 */
export function todayGroupToDto(group: TodayGroup, now: Date): TodayGroupDto {
  const overdueWeight = getOverdueCount(group.goal, now);
  return {
    goalId: group.goal.id,
    goalTitle: group.goal.title,
    goalArea: group.goal.area,
    goalPlantType: group.goal.plantType,
    goalStage: group.goal.stage,
    goalHealth: getHealth(overdueWeight),
    goalHealthState: getGoalHealthState(group.goal, now),
    goalOverdueCount: countOverdueTasks(group.goal, now),
    tasks: group.tasks.map((t) => ({ ...t })),
    routines: group.routines.map((r) => ({
      ...r,
      repeatDays: [...r.repeatDays] as TodayGroupDto["routines"][number]["repeatDays"],
    })),
  };
}
