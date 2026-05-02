"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { goalsApi, type GoalAndUser } from "@/client/api";
import type { GoalDto } from "@/shared/schemas/goal";
import type { TodayGroupDto, TodayResponse } from "@/shared/schemas/today";
import type { UserDto } from "@/shared/schemas/user";

import { queryKeys } from "./query-keys";

type ToggleTaskInput = { goalId: string; taskId: string; completed: boolean };
type ToggleRoutineInput = { goalId: string; routineId: string; completedToday: boolean };
type ToggleContext = { previous: TodayResponse | undefined };

/**
 * Toggle a task on the Today list with optimistic semantics.
 *
 * - `onMutate` snapshots `today` and writes the flipped item synchronously so
 *   the checkbox flips without waiting for the round-trip.
 * - `onError` restores the snapshot.
 * - `onSuccess` reconciles `today` from the server's authoritative goal so
 *   derived fields (stage, health) line up without a refetch flash, then
 *   writes the goal + user back into their respective caches.
 * - `onSettled` invalidates `garden` because completion may grow the plant.
 */
export function useToggleTodayTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, taskId, completed }: ToggleTaskInput) =>
      goalsApi.updateTask(goalId, taskId, { completed }),
    onMutate: ({ goalId, taskId, completed }) =>
      optimisticallyPatchToday(qc, goalId, (g) => ({
        ...g,
        tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)),
      })),
    onError: rollbackTodayCache(qc),
    onSuccess: applyServerTruth(qc),
    onSettled: invalidateGarden(qc),
  });
}

/** Same shape as {@link useToggleTodayTask}, for routines' `completedToday`. */
export function useToggleTodayRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, routineId, completedToday }: ToggleRoutineInput) =>
      goalsApi.updateRoutine(goalId, routineId, { completedToday }),
    onMutate: ({ goalId, routineId, completedToday }) =>
      optimisticallyPatchToday(qc, goalId, (g) => ({
        ...g,
        routines: g.routines.map((r) => (r.id === routineId ? { ...r, completedToday } : r)),
      })),
    onError: rollbackTodayCache(qc),
    onSuccess: applyServerTruth(qc),
    onSettled: invalidateGarden(qc),
  });
}

function optimisticallyPatchToday(
  qc: QueryClient,
  goalId: string,
  patchGroup: (group: TodayGroupDto) => TodayGroupDto,
): ToggleContext {
  const previous = qc.getQueryData<TodayResponse>(queryKeys.today());
  if (previous) {
    qc.setQueryData<TodayResponse>(queryKeys.today(), {
      groups: previous.groups.map((g) => (g.goalId === goalId ? patchGroup(g) : g)),
    });
  }
  return { previous };
}

function rollbackTodayCache(qc: QueryClient) {
  return (_err: unknown, _input: unknown, ctx: ToggleContext | undefined) => {
    if (ctx?.previous) qc.setQueryData(queryKeys.today(), ctx.previous);
  };
}

function applyServerTruth(qc: QueryClient) {
  return ({ goal, user }: GoalAndUser) => {
    reconcileTodayFromGoal(qc, goal);
    qc.setQueryData(queryKeys.goal(goal.id), goal);
    qc.setQueryData<GoalDto[]>(queryKeys.goals(), (prev) =>
      prev ? prev.map((g) => (g.id === goal.id ? goal : g)) : prev,
    );
    qc.setQueryData<UserDto>(queryKeys.me(), user);
  };
}

function invalidateGarden(qc: QueryClient) {
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.garden() });
  };
}

function reconcileTodayFromGoal(qc: QueryClient, goal: GoalDto): void {
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
