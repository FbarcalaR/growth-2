import type { Area } from "@/shared/areas";

import { AREA_RESOURCE } from "../area";
import { PLANT_DEFS } from "../plant/definitions";
import type { Resource } from "@/shared/resources";

import type { CompletionReward, Goal } from "./types";

export const TASK_COIN_REWARD = 3;
export const TASK_RESOURCE_REWARD = 4;
export const ROUTINE_COIN_REWARD = 2;
export const ROUTINE_RESOURCE_REWARD = 2;
export const PERMANENT_ROUTINE_BONUS = 5;
export const GOAL_COMPLETION_BONUS = 50;

/**
 * Compute the reward delta for completing (or uncompleting) a task on a goal.
 *
 * `completing=true` produces positive deltas; `completing=false` produces the
 * negative inverse so we can roll back a wrongly-checked task. Resources are
 * floored at 0 by `applyResourceDelta`, not here.
 */
export function taskCompletionReward(area: Area, completing: boolean): CompletionReward {
  const sign = completing ? 1 : -1;
  const primary = AREA_RESOURCE[area];
  return {
    coins: sign * TASK_COIN_REWARD,
    resources: { [primary]: sign * TASK_RESOURCE_REWARD } as Partial<Record<Resource, number>>,
  };
}

/**
 * Compute the reward delta for completing (or uncompleting) a routine on a
 * goal. Routines pay both the area's primary and the plant's secondary resource
 * so different routines feed both columns of the plant's stage requirements.
 */
export function routineCompletionReward(goal: Goal, completing: boolean): CompletionReward {
  const sign = completing ? 1 : -1;
  const primary = AREA_RESOURCE[goal.area];
  const secondary = PLANT_DEFS[goal.plantType].secondary;

  const resources: Partial<Record<Resource, number>> = {};
  resources[primary] = (resources[primary] ?? 0) + sign * ROUTINE_RESOURCE_REWARD;
  resources[secondary] = (resources[secondary] ?? 0) + sign * ROUTINE_RESOURCE_REWARD;

  return {
    coins: sign * ROUTINE_COIN_REWARD,
    resources,
  };
}
