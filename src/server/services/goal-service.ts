import "server-only";

import { type AppContainer } from "../container";
import { toISODate } from "../domain/clock";
import type { Completion, CompletionKind } from "../domain/completion/types";
import { DomainError } from "../domain/errors";
import { unplantGoalFromTile } from "../domain/garden/operations";
import {
  applyRoutineCompletion,
  applyTaskCompletion,
  completeRoutinePermanently,
} from "../domain/goal/completion";
import {
  completeGoal as completeGoalRule,
  replantGoal as replantGoalRule,
} from "../domain/goal/lifecycle";
import type { CompletionReward, Goal, GoalId, RoutineId, TaskId } from "../domain/goal/types";
import { AREA_DEFAULT_PLANT } from "../domain/area";
import type { Area } from "@/shared/areas";
import type { PlantId } from "../domain/plant/types";
import type { User } from "../domain/user/types";

import { newId } from "./ids";

export type GoalService = ReturnType<typeof createGoalService>;

/** A goal counts as "blooming" when it has been completed (trophy) or its
 * plant has reached full bloom (`stage === 4`). Mirrors the prototype's split
 * between active goals and the "Blooming & Completed" section on Plans. */
export type GoalListStatus = "active" | "blooming" | "all";

export function isBlooming(goal: Goal): boolean {
  return Boolean(goal.completed) || (goal.planted && goal.stage >= 4);
}

export function createGoalService({ clock, repos }: AppContainer) {
  /** Apply a coin/resource delta to a user's wallet, then persist. */
  async function applyReward(user: User, reward: CompletionReward): Promise<User> {
    const shopCoins = Math.max(0, user.shopCoins + reward.coins);
    const totalCoinsEarned =
      reward.coins > 0 ? user.totalCoinsEarned + reward.coins : user.totalCoinsEarned;
    return repos.users.update({ ...user, shopCoins, totalCoinsEarned });
  }

  async function loadGoal(userId: string, goalId: GoalId): Promise<Goal> {
    const goal = await repos.goals.findById(userId, goalId);
    if (!goal) throw new DomainError("GOAL_NOT_FOUND");
    return goal;
  }

  /** Append a completion event so the History tab can render it. */
  async function recordCompletion(
    userId: string,
    goalId: GoalId,
    kind: CompletionKind,
    itemId: TaskId | RoutineId | null,
    title: string,
  ): Promise<void> {
    const now = clock.now();
    const event: Completion = {
      id: newId("completion"),
      userId,
      goalId,
      kind,
      itemId,
      title,
      completedDate: toISODate(now),
      completedAt: now.getTime(),
    };
    await repos.completions.append(event);
  }

  return {
    async list(
      user: User,
      filters: { area?: Area; status?: GoalListStatus } = {},
    ): Promise<Goal[]> {
      const all = await repos.goals.listByUser(user.id);
      const status = filters.status ?? "all";
      return all.filter((g) => {
        if (filters.area && g.area !== filters.area) return false;
        if (status === "active") return !isBlooming(g);
        if (status === "blooming") return isBlooming(g);
        return true;
      });
    },

    get(user: User, goalId: GoalId): Promise<Goal> {
      return loadGoal(user.id, goalId);
    },

    async create(
      user: User,
      input: { title: string; area: Area; plantType?: PlantId },
    ): Promise<Goal> {
      const goal: Goal = {
        id: newId("goal"),
        userId: user.id,
        title: input.title,
        area: input.area,
        plantType: input.plantType ?? AREA_DEFAULT_PLANT[input.area],
        stage: 0,
        plantRes: {},
        planted: false,
        tileCol: null,
        tileRow: null,
        tasks: [],
        routines: [],
      };
      return repos.goals.create(goal);
    },

    async update(
      user: User,
      goalId: GoalId,
      changes: Partial<Pick<Goal, "title" | "area" | "plantType">>,
    ): Promise<Goal> {
      const goal = await loadGoal(user.id, goalId);
      if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
      return repos.goals.update({ ...goal, ...changes });
    },

    async delete(user: User, goalId: GoalId): Promise<void> {
      // Free its tile (if planted) before removing the goal.
      const goal = await loadGoal(user.id, goalId);
      if (goal.planted) {
        const garden = await repos.gardens.getOrCreate(user.id);
        const next = unplantGoalFromTile(goal, garden);
        await repos.gardens.update(next.garden);
      }
      await repos.goals.delete(user.id, goalId);
    },

    async addTask(
      user: User,
      goalId: GoalId,
      input: { title: string; dueDate?: string | null },
    ): Promise<Goal> {
      const goal = await loadGoal(user.id, goalId);
      if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
      const tasks = [
        ...goal.tasks,
        { id: newId("task"), title: input.title, completed: false, dueDate: input.dueDate ?? null },
      ];
      return repos.goals.update({ ...goal, tasks });
    },

    async updateTask(
      user: User,
      goalId: GoalId,
      taskId: TaskId,
      changes: Partial<{ title: string; dueDate: string | null; completed: boolean }>,
    ): Promise<{ goal: Goal; user: User }> {
      const goal = await loadGoal(user.id, goalId);
      if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
      const task = goal.tasks.find((t) => t.id === taskId);
      if (!task) throw new DomainError("TASK_NOT_FOUND");

      // If `completed` is being toggled, route through the domain rule so the
      // plant + wallet stay consistent. Other edits (title/dueDate) are simple
      // mutations.
      if (changes.completed !== undefined && changes.completed !== task.completed) {
        const result = applyTaskCompletion(goal, taskId);
        const persisted = await repos.goals.update(result.goal);
        const persistedUser = await applyReward(user, result.reward);
        // Record the completion event for the History tab — only when toggling
        // *on* (uncompleting a task isn't a "completion event").
        if (changes.completed === true) {
          await recordCompletion(user.id, goal.id, "task", taskId, task.title);
        }
        // Apply remaining edits (title/dueDate) on top.
        const stillToEdit = { ...changes };
        delete stillToEdit.completed;
        if (Object.keys(stillToEdit).length === 0) return { goal: persisted, user: persistedUser };
        const next = await repos.goals.update({
          ...persisted,
          tasks: persisted.tasks.map((t) => (t.id === taskId ? { ...t, ...stillToEdit } : t)),
        });
        return { goal: next, user: persistedUser };
      }

      const next = await repos.goals.update({
        ...goal,
        tasks: goal.tasks.map((t) => (t.id === taskId ? { ...t, ...changes } : t)),
      });
      return { goal: next, user };
    },

    async deleteTask(user: User, goalId: GoalId, taskId: TaskId): Promise<Goal> {
      const goal = await loadGoal(user.id, goalId);
      if (!goal.tasks.some((t) => t.id === taskId)) throw new DomainError("TASK_NOT_FOUND");
      return repos.goals.update({ ...goal, tasks: goal.tasks.filter((t) => t.id !== taskId) });
    },

    async addRoutine(
      user: User,
      goalId: GoalId,
      input: {
        title: string;
        repeatDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
      },
    ): Promise<Goal> {
      const goal = await loadGoal(user.id, goalId);
      if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
      const routines = [
        ...goal.routines,
        {
          id: newId("routine"),
          title: input.title,
          completedToday: false,
          streak: 0,
          repeatDays: input.repeatDays,
        },
      ];
      return repos.goals.update({ ...goal, routines });
    },

    async updateRoutine(
      user: User,
      goalId: GoalId,
      routineId: RoutineId,
      changes: Partial<{
        title: string;
        repeatDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
        completedToday: boolean;
      }>,
    ): Promise<{ goal: Goal; user: User }> {
      const goal = await loadGoal(user.id, goalId);
      if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
      const routine = goal.routines.find((r) => r.id === routineId);
      if (!routine) throw new DomainError("ROUTINE_NOT_FOUND");

      if (
        changes.completedToday !== undefined &&
        changes.completedToday !== routine.completedToday
      ) {
        const result = applyRoutineCompletion(goal, routineId);
        const persisted = await repos.goals.update(result.goal);
        const persistedUser = await applyReward(user, result.reward);
        if (changes.completedToday === true) {
          await recordCompletion(user.id, goal.id, "routine", routineId, routine.title);
        }
        const stillToEdit = { ...changes };
        delete stillToEdit.completedToday;
        if (Object.keys(stillToEdit).length === 0) return { goal: persisted, user: persistedUser };
        const next = await repos.goals.update({
          ...persisted,
          routines: persisted.routines.map((r) =>
            r.id === routineId ? { ...r, ...stillToEdit } : r,
          ),
        });
        return { goal: next, user: persistedUser };
      }

      const next = await repos.goals.update({
        ...goal,
        routines: goal.routines.map((r) => (r.id === routineId ? { ...r, ...changes } : r)),
      });
      return { goal: next, user };
    },

    async deleteRoutine(user: User, goalId: GoalId, routineId: RoutineId): Promise<Goal> {
      const goal = await loadGoal(user.id, goalId);
      if (!goal.routines.some((r) => r.id === routineId))
        throw new DomainError("ROUTINE_NOT_FOUND");
      return repos.goals.update({
        ...goal,
        routines: goal.routines.filter((r) => r.id !== routineId),
      });
    },

    async completeRoutinePermanent(
      user: User,
      goalId: GoalId,
      routineId: RoutineId,
    ): Promise<{ goal: Goal; user: User }> {
      const goal = await loadGoal(user.id, goalId);
      const routine = goal.routines.find((r) => r.id === routineId);
      const result = completeRoutinePermanently(goal, routineId);
      const persisted = await repos.goals.update(result.goal);
      const persistedUser = await applyReward(user, result.reward);
      if (routine) {
        await recordCompletion(user.id, goal.id, "routine", routineId, routine.title);
      }
      return { goal: persisted, user: persistedUser };
    },

    async complete(user: User, goalId: GoalId): Promise<{ goal: Goal; user: User }> {
      const goal = await loadGoal(user.id, goalId);
      const result = completeGoalRule(goal, clock.now());

      // If the goal was on a tile, free it.
      if (goal.planted && goal.tileCol !== null && goal.tileRow !== null) {
        const garden = await repos.gardens.getOrCreate(user.id);
        const detached = unplantGoalFromTile(result.goal, garden);
        const owned = detached.garden.owned.includes(result.trophyId)
          ? detached.garden.owned
          : [...detached.garden.owned, result.trophyId];
        await repos.gardens.update({ ...detached.garden, owned });
      } else {
        const garden = await repos.gardens.getOrCreate(user.id);
        const owned = garden.owned.includes(result.trophyId)
          ? garden.owned
          : [...garden.owned, result.trophyId];
        await repos.gardens.update({ ...garden, owned });
      }

      const persisted = await repos.goals.update(result.goal);
      const persistedUser = await applyReward(user, result.reward);
      await recordCompletion(user.id, goal.id, "goal", null, goal.title);
      return { goal: persisted, user: persistedUser };
    },

    async replant(user: User, goalId: GoalId): Promise<Goal> {
      const goal = await loadGoal(user.id, goalId);
      const next = replantGoalRule(goal, clock.now());
      return repos.goals.update(next);
    },
  };
}
