import { z } from "zod";

import {
  CreateGoalRequestSchema,
  CreateRoutineRequestSchema,
  CreateTaskRequestSchema,
  GoalDtoSchema,
  UpdateGoalRequestSchema,
  UpdateRoutineRequestSchema,
  UpdateTaskRequestSchema,
  type CreateGoalRequest,
  type CreateRoutineRequest,
  type CreateTaskRequest,
  type GoalDto,
  type UpdateGoalRequest,
  type UpdateRoutineRequest,
  type UpdateTaskRequest,
} from "@/shared/schemas/goal";
import { UserDtoSchema, type UserDto } from "@/shared/schemas/user";

import { apiFetch, apiFetchVoid } from "./client";

const GoalListResponseSchema = z.object({ goals: z.array(GoalDtoSchema) });
const GoalAndUserResponseSchema = z.object({ goal: GoalDtoSchema, user: UserDtoSchema });

export type GoalAndUser = { goal: GoalDto; user: UserDto };

export const goalsApi = {
  list: (signal?: AbortSignal) =>
    apiFetch("/api/goals", GoalListResponseSchema, { signal }).then((r) => r.goals),

  get: (id: string, signal?: AbortSignal) =>
    apiFetch<GoalDto>(`/api/goals/${encodeURIComponent(id)}`, GoalDtoSchema, { signal }),

  create: (input: CreateGoalRequest) =>
    apiFetch<GoalDto>("/api/goals", GoalDtoSchema, {
      method: "POST",
      body: CreateGoalRequestSchema.parse(input),
    }),

  update: (id: string, input: UpdateGoalRequest) =>
    apiFetch<GoalDto>(`/api/goals/${encodeURIComponent(id)}`, GoalDtoSchema, {
      method: "PATCH",
      body: UpdateGoalRequestSchema.parse(input),
    }),

  delete: (id: string) =>
    apiFetchVoid(`/api/goals/${encodeURIComponent(id)}`, { method: "DELETE" }),

  addTask: (goalId: string, input: CreateTaskRequest) =>
    apiFetch<GoalDto>(`/api/goals/${encodeURIComponent(goalId)}/tasks`, GoalDtoSchema, {
      method: "POST",
      body: CreateTaskRequestSchema.parse(input),
    }),

  updateTask: (goalId: string, taskId: string, input: UpdateTaskRequest): Promise<GoalAndUser> =>
    apiFetch(
      `/api/goals/${encodeURIComponent(goalId)}/tasks/${encodeURIComponent(taskId)}`,
      GoalAndUserResponseSchema,
      { method: "PATCH", body: UpdateTaskRequestSchema.parse(input) },
    ),

  deleteTask: (goalId: string, taskId: string) =>
    apiFetch<GoalDto>(
      `/api/goals/${encodeURIComponent(goalId)}/tasks/${encodeURIComponent(taskId)}`,
      GoalDtoSchema,
      { method: "DELETE" },
    ),

  addRoutine: (goalId: string, input: CreateRoutineRequest) =>
    apiFetch<GoalDto>(`/api/goals/${encodeURIComponent(goalId)}/routines`, GoalDtoSchema, {
      method: "POST",
      body: CreateRoutineRequestSchema.parse(input),
    }),

  updateRoutine: (
    goalId: string,
    routineId: string,
    input: UpdateRoutineRequest,
  ): Promise<GoalAndUser> =>
    apiFetch(
      `/api/goals/${encodeURIComponent(goalId)}/routines/${encodeURIComponent(routineId)}`,
      GoalAndUserResponseSchema,
      { method: "PATCH", body: UpdateRoutineRequestSchema.parse(input) },
    ),

  deleteRoutine: (goalId: string, routineId: string) =>
    apiFetch<GoalDto>(
      `/api/goals/${encodeURIComponent(goalId)}/routines/${encodeURIComponent(routineId)}`,
      GoalDtoSchema,
      { method: "DELETE" },
    ),

  completeRoutinePermanent: (goalId: string, routineId: string): Promise<GoalAndUser> =>
    apiFetch(
      `/api/goals/${encodeURIComponent(goalId)}/routines/${encodeURIComponent(routineId)}/permanent`,
      GoalAndUserResponseSchema,
      { method: "POST" },
    ),

  complete: (goalId: string): Promise<GoalAndUser> =>
    apiFetch(`/api/goals/${encodeURIComponent(goalId)}/complete`, GoalAndUserResponseSchema, {
      method: "POST",
    }),

  replant: (goalId: string) =>
    apiFetch<GoalDto>(`/api/goals/${encodeURIComponent(goalId)}/replant`, GoalDtoSchema, {
      method: "POST",
    }),
};
