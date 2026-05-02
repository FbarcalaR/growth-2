/** Catalog of plant variants. The order is fixed and used as a stable enum. */
export const PLANT_IDS = [
  "herb",
  "sunflower",
  "money_tree",
  "rose",
  "mushroom",
  "crystal",
  "moon_flower",
] as const;

export type PlantId = (typeof PLANT_IDS)[number];

/** 0 = Seed, 1 = Sprout, 2 = Seedling, 3 = Mature, 4 = Blooming. */
export type Stage = 0 | 1 | 2 | 3 | 4;

export const STAGES = [0, 1, 2, 3, 4] as const satisfies readonly Stage[];

export const STAGE_NAMES: Record<Stage, string> = {
  0: "Seed",
  1: "Sprout",
  2: "Seedling",
  3: "Mature",
  4: "Blooming",
};

/** Per-stage tint used by goal-card chips ("Sprout", "Seedling", ...). */
export const STAGE_COLORS: Record<Stage, string> = {
  0: "#F9A825",
  1: "#A5D6A7",
  2: "#66BB6A",
  3: "#43A047",
  4: "#2E7D32",
};

/**
 * Human-readable plant catalog labels. Lives alongside `PLANT_IDS` so client
 * surfaces (plant pickers, goal cards) don't have to reach into the server
 * domain just to render a name.
 */
export const PLANT_LABELS: Record<PlantId, string> = {
  herb: "Herb",
  sunflower: "Sunflower",
  money_tree: "Money Tree",
  rose: "Rose",
  mushroom: "Mushroom",
  crystal: "Crystal",
  moon_flower: "Moon Flower",
};

import type { Area } from "./areas";

/** Suggested default plant kind per life area. Mirrors the server's
 * `AREA_DEFAULT_PLANT` so the create-goal modal can pre-fill the picker
 * without crossing the client→server boundary. */
export const AREA_DEFAULT_PLANT: Record<Area, PlantId> = {
  health: "herb",
  career: "sunflower",
  finances: "money_tree",
  relationships: "rose",
  personal: "mushroom",
  fun: "crystal",
  spirituality: "moon_flower",
};
