import type { Goal } from "../goal/types";

import { PLANT_DEFS } from "./definitions";
import type { ResourceCost, Stage } from "./types";
import { MAX_STAGE } from "./types";

/** Cumulative `plantRes` covers the requirement (≥). */
export function meetsRequirement(plantRes: ResourceCost, req: ResourceCost): boolean {
  for (const [key, needed] of Object.entries(req)) {
    if (needed === undefined) continue;
    const have = plantRes[key as keyof ResourceCost] ?? 0;
    if (have < needed) return false;
  }
  return true;
}

/**
 * Advance the plant to the highest stage its accumulated resources qualify for.
 * Idempotent: calling it twice is a no-op the second time.
 *
 * Doesn't mutate. Returns a new Goal if the stage changed; the same instance otherwise.
 */
export function growPlant(goal: Goal): Goal {
  if (goal.completed) return goal;
  const def = PLANT_DEFS[goal.plantType];
  let nextStage: Stage = goal.stage;

  // The tuple type `[X, X, X, X]` rejects index 4 statically even though the
  // loop condition prevents it at runtime. Index through an array-typed alias.
  const reqs: ResourceCost[] = def.requirements;
  while (nextStage < MAX_STAGE) {
    const req = reqs[nextStage];
    if (!req) break;
    if (!meetsRequirement(goal.plantRes, req)) break;
    nextStage = (nextStage + 1) as Stage;
  }

  if (nextStage === goal.stage) return goal;
  return { ...goal, stage: nextStage };
}
