import { toISODate } from "../../domain/clock";
import {
  countOverdueTasks,
  getGoalHealthState,
  getHealth,
  getOverdueCount,
} from "../../domain/health";
import type { Goal, Routine } from "../../domain/goal/types";
import type { GoalDto, RoutineDto } from "@/shared/schemas/goal";

/**
 * Domain `Routine` → wire `RoutineDto`. The wire keeps the historical
 * `completedToday: boolean` field; we derive it from `lastCompletedOn`
 * against the current date so a routine completed Monday automatically
 * appears uncompleted on Tuesday without any background job. Graduated
 * routines (`permanentlyCompleted: true`) are forced `completedToday:
 * true` because they're "done forever".
 */
function routineToDto(r: Routine, today: string): RoutineDto {
  return {
    id: r.id,
    title: r.title,
    completedToday: Boolean(r.permanentlyCompleted) || r.lastCompletedOn === today,
    streak: r.streak,
    repeatDays: [...r.repeatDays] as RoutineDto["repeatDays"],
    ...(r.permanentlyCompleted ? { permanentlyCompleted: true } : {}),
    createdAt: r.createdAt,
  };
}

/**
 * Domain `Goal` → wire `GoalDto`. Drops `userId` (the wire is already
 * user-scoped via the session) and adds derived `health` + `healthState` +
 * `overdueCount`, all computed at read time and never persisted.
 */
export function goalToDto(goal: Goal, now: Date): GoalDto {
  const overdueWeight = getOverdueCount(goal, now);
  const today = toISODate(now);
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
    routines: goal.routines.map((r) => routineToDto(r, today)),
    completed: goal.completed,
    completedAt: goal.completedAt,
    trophyId: goal.trophyId,
    health: getHealth(overdueWeight),
    healthState: getGoalHealthState(goal, now),
    overdueCount: countOverdueTasks(goal, now),
  };
}

export { routineToDto };
