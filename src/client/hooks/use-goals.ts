"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { goalsApi, type GoalAndUser } from "@/client/api";
import type {
  CreateGoalRequest,
  CreateRoutineRequest,
  CreateTaskRequest,
  GoalDto,
  UpdateGoalRequest,
  UpdateRoutineRequest,
  UpdateTaskRequest,
} from "@/shared/schemas/goal";
import type { UserDto } from "@/shared/schemas/user";

import { queryKeys } from "./query-keys";

export function useGoals() {
  return useQuery<GoalDto[]>({
    queryKey: queryKeys.goals(),
    queryFn: ({ signal }) => goalsApi.list(signal),
  });
}

export function useGoal(id: string) {
  return useQuery<GoalDto>({
    queryKey: queryKeys.goal(id),
    queryFn: ({ signal }) => goalsApi.get(id, signal),
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalRequest) => goalsApi.create(input),
    onSuccess: (goal) => {
      qc.setQueryData<GoalDto[]>(queryKeys.goals(), (prev) => (prev ? [...prev, goal] : [goal]));
      qc.setQueryData(queryKeys.goal(goal.id), goal);
    },
  });
}

export function useUpdateGoal(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateGoalRequest) => goalsApi.update(id, input),
    onSuccess: (goal) => writeGoalIntoCache(qc, goal),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: (_, id) => {
      qc.setQueryData<GoalDto[]>(queryKeys.goals(), (prev) =>
        prev ? prev.filter((g) => g.id !== id) : prev,
      );
      qc.removeQueries({ queryKey: queryKeys.goal(id) });
      // Garden may have lost a tile.
      qc.invalidateQueries({ queryKey: queryKeys.garden() });
    },
  });
}

export function useAddTask(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskRequest) => goalsApi.addTask(goalId, input),
    onSuccess: (goal) => writeGoalIntoCache(qc, goal),
  });
}

export function useUpdateTask(goalId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTaskRequest) => goalsApi.updateTask(goalId, taskId, input),
    onSuccess: ({ goal, user }) => {
      writeGoalIntoCache(qc, goal);
      qc.setQueryData(queryKeys.me(), user);
    },
  });
}

export function useDeleteTask(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => goalsApi.deleteTask(goalId, taskId),
    onSuccess: (goal) => writeGoalIntoCache(qc, goal),
  });
}

export function useAddRoutine(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoutineRequest) => goalsApi.addRoutine(goalId, input),
    onSuccess: (goal) => writeGoalIntoCache(qc, goal),
  });
}

export function useUpdateRoutine(goalId: string, routineId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRoutineRequest) => goalsApi.updateRoutine(goalId, routineId, input),
    onSuccess: ({ goal, user }) => {
      writeGoalIntoCache(qc, goal);
      qc.setQueryData(queryKeys.me(), user);
    },
  });
}

export function useDeleteRoutine(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (routineId: string) => goalsApi.deleteRoutine(goalId, routineId),
    onSuccess: (goal) => writeGoalIntoCache(qc, goal),
  });
}

export function useCompleteRoutinePermanent(goalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (routineId: string) => goalsApi.completeRoutinePermanent(goalId, routineId),
    onSuccess: ({ goal, user }: GoalAndUser) => {
      writeGoalIntoCache(qc, goal);
      qc.setQueryData(queryKeys.me(), user);
    },
  });
}

export function useCompleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.complete(id),
    onSuccess: ({ goal, user }: GoalAndUser) => {
      writeGoalIntoCache(qc, goal);
      qc.setQueryData(queryKeys.me(), user);
      qc.invalidateQueries({ queryKey: queryKeys.garden() });
    },
  });
}

export function useReplantGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.replant(id),
    onSuccess: (goal) => writeGoalIntoCache(qc, goal),
  });
}

function writeGoalIntoCache(qc: ReturnType<typeof useQueryClient>, goal: GoalDto): void {
  qc.setQueryData(queryKeys.goal(goal.id), goal);
  qc.setQueryData<GoalDto[]>(queryKeys.goals(), (prev) =>
    prev ? prev.map((g) => (g.id === goal.id ? goal : g)) : prev,
  );
}

// Re-export for convenience.
export type { UserDto };
