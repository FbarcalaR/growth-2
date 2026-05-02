"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { goalsApi } from "@/client/api";
import type { GoalDto } from "@/shared/schemas/goal";
import type { TodayResponse } from "@/shared/schemas/today";
import type { UserDto } from "@/shared/schemas/user";

import { queryKeys } from "./query-keys";

type ToggleTaskInput = { goalId: string; taskId: string; completed: boolean };
type ToggleRoutineInput = { goalId: string; routineId: string; completedToday: boolean };
type Snapshot = { previous: TodayResponse | undefined };

/**
 * Toggle a task from the Today list. Optimistically flips the item in the
 * `today` cache; rolls back on error; on success writes the updated goal +
 * user back into their caches and invalidates `today` + `garden` so any
 * downstream changes (plant stage, tile state) are picked up.
 */
export function useToggleTodayTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, taskId, completed }: ToggleTaskInput) =>
      goalsApi.updateTask(goalId, taskId, { completed }),
    onMutate: ({ goalId, taskId, completed }): Snapshot => {
      const previous = qc.getQueryData<TodayResponse>(queryKeys.today());
      if (previous) {
        qc.setQueryData<TodayResponse>(queryKeys.today(), {
          groups: previous.groups.map((g) =>
            g.goalId === goalId
              ? {
                  ...g,
                  tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)),
                }
              : g,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.today(), ctx.previous);
    },
    onSuccess: ({ goal, user }) => {
      // Reconcile the today cache from the authoritative goal so derived
      // fields (health, stage, plantRes) line up with what the server saw,
      // without triggering a refetch that would overwrite our optimistic
      // state with a stale snapshot.
      reconcileTodayFromGoal(qc, goal);
      writeGoalAndUser(qc, goal, user);
    },
    onSettled: () => {
      // The plant may have grown / a tile may have changed.
      qc.invalidateQueries({ queryKey: queryKeys.garden() });
    },
  });
}

/** Toggle a routine's "done today" flag with the same optimistic semantics. */
export function useToggleTodayRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, routineId, completedToday }: ToggleRoutineInput) =>
      goalsApi.updateRoutine(goalId, routineId, { completedToday }),
    onMutate: ({ goalId, routineId, completedToday }): Snapshot => {
      const previous = qc.getQueryData<TodayResponse>(queryKeys.today());
      if (previous) {
        qc.setQueryData<TodayResponse>(queryKeys.today(), {
          groups: previous.groups.map((g) =>
            g.goalId === goalId
              ? {
                  ...g,
                  routines: g.routines.map((r) =>
                    r.id === routineId ? { ...r, completedToday } : r,
                  ),
                }
              : g,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.today(), ctx.previous);
    },
    onSuccess: ({ goal, user }) => {
      reconcileTodayFromGoal(qc, goal);
      writeGoalAndUser(qc, goal, user);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.garden() });
    },
  });
}

function reconcileTodayFromGoal(qc: ReturnType<typeof useQueryClient>, goal: GoalDto): void {
  qc.setQueryData<TodayResponse>(queryKeys.today(), (prev) => {
    if (!prev) return prev;
    return {
      groups: prev.groups.map((g) =>
        g.goalId === goal.id
          ? {
              ...g,
              tasks: goal.tasks,
              routines: goal.routines,
              goalStage: goal.stage,
              goalHealth: goal.health,
              goalHealthState: goal.healthState,
            }
          : g,
      ),
    };
  });
}

function writeGoalAndUser(
  qc: ReturnType<typeof useQueryClient>,
  goal: GoalDto,
  user: UserDto,
): void {
  qc.setQueryData(queryKeys.goal(goal.id), goal);
  qc.setQueryData<GoalDto[]>(queryKeys.goals(), (prev) =>
    prev ? prev.map((g) => (g.id === goal.id ? goal : g)) : prev,
  );
  qc.setQueryData(queryKeys.me(), user);
}
