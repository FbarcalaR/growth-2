import { toISODate } from "../clock";
import { DomainError } from "../errors";

import { GOAL_COMPLETION_BONUS } from "./rewards";
import type { CompletionReward, Goal, ISODate, TrophyId } from "./types";

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
