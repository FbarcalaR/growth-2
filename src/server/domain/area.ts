import type { Area } from "@/shared/areas";
import type { Resource } from "@/shared/resources";

export { AREA_DEFAULT_PLANT } from "@/shared/plants";

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
