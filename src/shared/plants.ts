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
