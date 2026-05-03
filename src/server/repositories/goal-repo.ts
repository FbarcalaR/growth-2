import type { Goal } from "../domain/goal/types";
import type { UserId } from "../domain/user/types";

export type GoalRepo = {
  create(goal: Goal): Promise<Goal>;
  findById(userId: UserId, goalId: string): Promise<Goal | null>;
  listByUser(userId: UserId): Promise<Goal[]>;
  update(goal: Goal): Promise<Goal>;
  delete(userId: UserId, goalId: string): Promise<void>;
  /** Drop every goal owned by `userId`. Used by the reset / import flows. */
  deleteAllByUser(userId: UserId): Promise<void>;
};
