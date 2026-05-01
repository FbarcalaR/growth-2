import type { Resource } from "@/shared/resources";

export type PlantId =
  | "herb"
  | "sunflower"
  | "money_tree"
  | "rose"
  | "mushroom"
  | "crystal"
  | "moon_flower";

/** 0=Seed, 1=Sprout, 2=Seedling, 3=Mature, 4=Blooming. */
export type Stage = 0 | 1 | 2 | 3 | 4;

export const MAX_STAGE: Stage = 4;

export type ResourceCost = Partial<Record<Resource, number>>;
export type ResourceDelta = Partial<Record<Resource, number>>;

export type PlantDef = {
  id: PlantId;
  name: string;
  primary: Resource;
  secondary: Resource;
  /** Cumulative resources required to advance from stage N to N+1 (4 entries: 0→1, 1→2, 2→3, 3→4). */
  requirements: [ResourceCost, ResourceCost, ResourceCost, ResourceCost];
};
