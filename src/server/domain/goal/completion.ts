import { DomainError } from "../errors";
import { growPlant } from "../plant/growth";
import { applyResourceDelta } from "../plant/resources";

import { PERMANENT_ROUTINE_BONUS, routineCompletionReward, taskCompletionReward } from "./rewards";
import type { CompletionReward, Goal, RoutineId, TaskId } from "./types";

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
 * Toggle a routine for today and apply its reward. Bumps streak when
 * completing, decrements (floored at 0) when uncompleting.
 */
export function applyRoutineCompletion(goal: Goal, routineId: RoutineId): ToggleResult {
  if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
  const routine = goal.routines.find((r) => r.id === routineId);
  if (!routine) throw new DomainError("ROUTINE_NOT_FOUND");

  const completing = !routine.completedToday;
  const reward = routineCompletionReward(goal, completing);

  const routines = goal.routines.map((r) =>
    r.id === routineId
      ? {
          ...r,
          completedToday: completing,
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
 * daily action. Awards a small bonus.
 */
export function completeRoutinePermanently(goal: Goal, routineId: RoutineId): ToggleResult {
  if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
  const routine = goal.routines.find((r) => r.id === routineId);
  if (!routine) throw new DomainError("ROUTINE_NOT_FOUND");

  const routines = goal.routines.map((r) =>
    r.id === routineId ? { ...r, permanentlyCompleted: true, completedToday: true } : r,
  );
  return {
    goal: { ...goal, routines },
    reward: { coins: PERMANENT_ROUTINE_BONUS, resources: {} },
  };
}
