import { addDaysISO, toISODate } from "./clock";
import { DomainError } from "./errors";
import { growPlant } from "./plants";
import { applyResourceDelta } from "./resources";
import {
  GOAL_COMPLETION_BONUS,
  PERMANENT_ROUTINE_BONUS,
  routineCompletionReward,
  taskCompletionReward,
} from "./rewards";
import type { CompletionReward, Goal, ISODate, RoutineId, TaskId, TrophyId } from "./types";

type ToggleResult = {
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

export type GoalCompletionResult = {
  goal: Goal;
  reward: CompletionReward;
  trophyId: TrophyId;
};

/**
 * Mark a goal as completed: award the bonus + a unique trophy, blossom the
 * plant, and free its tile. The caller is responsible for adding the trophy to
 * `garden.owned`.
 */
export function completeGoal(goal: Goal, now: Date): GoalCompletionResult {
  if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
  const trophyId: TrophyId = `trophy_${goal.id}`;
  const next: Goal = {
    ...goal,
    completed: true,
    completedAt: now.getTime(),
    stage: 4,
    trophyId,
    planted: false,
    tileCol: null,
    tileRow: null,
  };
  return {
    goal: next,
    reward: { coins: GOAL_COMPLETION_BONUS, resources: {} },
    trophyId,
  };
}

/**
 * Bring a dead plant back to life. Stage resets to 1, plant resources clear,
 * and any overdue (incomplete) task is rescheduled to today so the user keeps
 * the work but the clock restarts.
 */
export function replantGoal(goal: Goal, now: Date): Goal {
  if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
  const today: ISODate = toISODate(now);
  const tasks = goal.tasks.map((t) => {
    if (t.completed) return t;
    if (!t.dueDate) return t;
    if (t.dueDate < today) return { ...t, dueDate: today };
    return t;
  });
  return { ...goal, stage: 1, plantRes: {}, tasks };
}

export { addDaysISO, toISODate };
