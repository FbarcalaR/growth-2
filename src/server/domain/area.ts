import type { Area } from "@/shared/areas";
import type { Resource } from "@/shared/resources";

import type { PlantId } from "./plant/types";

/**
 * The primary resource a life area feeds. Completing a task in a given area
 * awards this resource.
 */
export const AREA_RESOURCE: Record<Area, Resource> = {
  health: "water",
  career: "sunlight",
  finances: "gold",
  relationships: "love",
  personal: "nutrients",
  fun: "magic",
  spirituality: "moonlight",
};

/** Suggested default plant kind per area. */
export const AREA_DEFAULT_PLANT: Record<Area, PlantId> = {
  health: "herb",
  career: "sunflower",
  finances: "money_tree",
  relationships: "rose",
  personal: "mushroom",
  fun: "crystal",
  spirituality: "moon_flower",
};
