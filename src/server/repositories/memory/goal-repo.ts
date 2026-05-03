import { DomainError } from "../../domain/errors";
import type { Goal } from "../../domain/goal/types";
import type { UserId } from "../../domain/user/types";
import type { GoalRepo } from "../goal-repo";

function clone(goal: Goal): Goal {
  return {
    ...goal,
    plantRes: { ...goal.plantRes },
    tasks: goal.tasks.map((t) => ({ ...t })),
    routines: goal.routines.map((r) => ({
      ...r,
      repeatDays: [...r.repeatDays] as Goal["routines"][number]["repeatDays"],
    })),
  };
}

export function createInMemoryGoalRepo(): GoalRepo {
  // Indexed by composite (userId, goalId) for ownership-safe lookups.
  const byUser = new Map<UserId, Map<string, Goal>>();

  function bucket(userId: UserId): Map<string, Goal> {
    let bucket = byUser.get(userId);
    if (!bucket) {
      bucket = new Map();
      byUser.set(userId, bucket);
    }
    return bucket;
  }

  return {
    async create(goal) {
      const stored = clone(goal);
      bucket(goal.userId).set(goal.id, stored);
      return clone(stored);
    },

    async findById(userId, goalId) {
      const goal = byUser.get(userId)?.get(goalId);
      return goal ? clone(goal) : null;
    },

    async listByUser(userId) {
      const all = byUser.get(userId);
      if (!all) return [];
      return [...all.values()].map(clone);
    },

    async update(goal) {
      const existing = byUser.get(goal.userId)?.get(goal.id);
      if (!existing) throw new DomainError("GOAL_NOT_FOUND");
      const stored = clone(goal);
      bucket(goal.userId).set(goal.id, stored);
      return clone(stored);
    },

    async delete(userId, goalId) {
      const bucket = byUser.get(userId);
      if (!bucket || !bucket.has(goalId)) throw new DomainError("GOAL_NOT_FOUND");
      bucket.delete(goalId);
    },

    async deleteAllByUser(userId) {
      byUser.delete(userId);
    },
  };
}
