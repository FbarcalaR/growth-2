import { getGoalHealthState, getHealth, getOverdueCount } from "../../domain/health";
import type { Goal } from "../../domain/goal/types";
import type { GoalDto } from "@/shared/schemas/goal";

/**
 * Domain `Goal` → wire `GoalDto`. Drops `userId` (the wire is already
 * user-scoped via the session) and adds derived `health` + `healthState`,
 * which are computed at read time and never persisted.
 */
export function goalToDto(goal: Goal, now: Date): GoalDto {
  const overdue = getOverdueCount(goal, now);
  return {
    id: goal.id,
    title: goal.title,
    area: goal.area,
    plantType: goal.plantType,
    stage: goal.stage,
    plantRes: { ...goal.plantRes },
    planted: goal.planted,
    tileCol: goal.tileCol,
    tileRow: goal.tileRow,
    tasks: goal.tasks.map((t) => ({ ...t })),
    routines: goal.routines.map((r) => ({
      ...r,
      repeatDays: [...r.repeatDays] as GoalDto["routines"][number]["repeatDays"],
    })),
    completed: goal.completed,
    completedAt: goal.completedAt,
    trophyId: goal.trophyId,
    health: getHealth(overdue),
    healthState: getGoalHealthState(goal, now),
  };
}
