import type { Goal, PlantDef, PlantId, ResourceCost, Stage } from "./types";

export const PLANT_DEFS: Record<PlantId, PlantDef> = {
  herb: {
    id: "herb",
    name: "Herb",
    primary: "water",
    secondary: "nutrients",
    requirements: [
      { water: 8, nutrients: 4 },
      { water: 16, nutrients: 8 },
      { water: 28, nutrients: 14 },
      { water: 44, nutrients: 22 },
    ],
  },
  sunflower: {
    id: "sunflower",
    name: "Sunflower",
    primary: "sunlight",
    secondary: "water",
    requirements: [
      { sunlight: 8, water: 4 },
      { sunlight: 16, water: 8 },
      { sunlight: 28, water: 14 },
      { sunlight: 44, water: 22 },
    ],
  },
  money_tree: {
    id: "money_tree",
    name: "Money Tree",
    primary: "gold",
    secondary: "sunlight",
    requirements: [
      { gold: 6, sunlight: 4 },
      { gold: 12, sunlight: 8 },
      { gold: 22, sunlight: 14 },
      { gold: 35, sunlight: 22 },
    ],
  },
  rose: {
    id: "rose",
    name: "Rose",
    primary: "love",
    secondary: "water",
    requirements: [
      { love: 8, water: 4 },
      { love: 16, water: 8 },
      { love: 28, water: 14 },
      { love: 44, water: 22 },
    ],
  },
  mushroom: {
    id: "mushroom",
    name: "Mushroom",
    primary: "nutrients",
    secondary: "moonlight",
    requirements: [
      { nutrients: 8, moonlight: 4 },
      { nutrients: 16, moonlight: 8 },
      { nutrients: 28, moonlight: 14 },
      { nutrients: 44, moonlight: 22 },
    ],
  },
  crystal: {
    id: "crystal",
    name: "Crystal",
    primary: "magic",
    secondary: "love",
    requirements: [
      { magic: 8, love: 4 },
      { magic: 16, love: 8 },
      { magic: 28, love: 14 },
      { magic: 44, love: 22 },
    ],
  },
  moon_flower: {
    id: "moon_flower",
    name: "Moon Flower",
    primary: "moonlight",
    secondary: "magic",
    requirements: [
      { moonlight: 8, magic: 4 },
      { moonlight: 16, magic: 8 },
      { moonlight: 28, magic: 14 },
      { moonlight: 44, magic: 22 },
    ],
  },
};

export const STAGE_NAMES = ["Seed", "Sprout", "Seedling", "Mature", "Blooming"] as const;
export const MAX_STAGE: Stage = 4;

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
