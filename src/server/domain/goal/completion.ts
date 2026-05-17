import { DomainError } from "../errors";
import { growPlant } from "../plant/growth";
import { applyResourceDelta } from "../plant/resources";

import { PERMANENT_ROUTINE_BONUS, routineCompletionReward, taskCompletionReward } from "./rewards";
import type { CompletionReward, Goal, ISODate, RoutineId, TaskId } from "./types";

export type ToggleResult = {
  goal: Goal;
  reward: CompletionReward;
};

/**
 * Toggle a task and apply its reward to the plant. Returns the updated goal
 * (with `growPlant` already applied) and the coin/resource delta the caller
 * should apply to the user's wallet.
 *
 * Throws DomainError if the task isn't on this goal.
 */
export function applyTaskCompletion(goal: Goal, taskId: TaskId): ToggleResult {
  if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
  const task = goal.tasks.find((t) => t.id === taskId);
  if (!task) throw new DomainError("TASK_NOT_FOUND");

  const completing = !task.completed;
  const reward = taskCompletionReward(goal.area, completing);

  const tasks = goal.tasks.map((t) => (t.id === taskId ? { ...t, completed: completing } : t));
  const plantRes = applyResourceDelta(goal.plantRes, reward.resources);
  const next = growPlant({ ...goal, tasks, plantRes });

  return { goal: next, reward };
}

/**
 * Toggle a routine's "done for today" state.
 *
 * Day-rollover behaviour: storage tracks `lastCompletedOn` (an ISO date).
 * Whether the routine is currently considered done is derived as
 * `lastCompletedOn === today`. So a routine completed Monday automatically
 * appears uncompleted on Tuesday without any background job — the next
 * read just compares against a different `today`.
 *
 * Toggling on `today` sets `lastCompletedOn = today`, bumps streak, and
 * awards resources (the plant grows). Toggling off — only valid on the
 * same day it was completed — clears `lastCompletedOn`, decrements streak
 * (floored at 0), and reverses the resource delta (the plant steps back).
 */
export function applyRoutineCompletion(
  goal: Goal,
  routineId: RoutineId,
  today: ISODate,
): ToggleResult {
  if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
  const routine = goal.routines.find((r) => r.id === routineId);
  if (!routine) throw new DomainError("ROUTINE_NOT_FOUND");

  const wasCompletedToday = routine.lastCompletedOn === today;
  const completing = !wasCompletedToday;
  const reward = routineCompletionReward(goal, completing);

  const routines = goal.routines.map((r) =>
    r.id === routineId
      ? {
          ...r,
          lastCompletedOn: completing ? today : null,
          streak: completing ? r.streak + 1 : Math.max(0, r.streak - 1),
        }
      : r,
  );
  const plantRes = applyResourceDelta(goal.plantRes, reward.resources);
  const next = growPlant({ ...goal, routines, plantRes });

  return { goal: next, reward };
}

/**
 * Permanently graduate a routine — it stays visible but no longer demands
 * daily action. Awards a small bonus. Records `lastCompletedOn = today`
 * for symmetry; the DTO layer also forces `completedToday: true` for any
 * `permanentlyCompleted` routine so the graduated state stays sticky.
 */
export function completeRoutinePermanently(
  goal: Goal,
  routineId: RoutineId,
  today: ISODate,
): ToggleResult {
  if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
  const routine = goal.routines.find((r) => r.id === routineId);
  if (!routine) throw new DomainError("ROUTINE_NOT_FOUND");

  const routines = goal.routines.map((r) =>
    r.id === routineId ? { ...r, permanentlyCompleted: true, lastCompletedOn: today } : r,
  );
  return {
    goal: { ...goal, routines },
    reward: { coins: PERMANENT_ROUTINE_BONUS, resources: {} },
  };
}
