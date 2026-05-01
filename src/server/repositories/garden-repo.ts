import type { GardenState } from "../domain/garden/types";
import type { UserId } from "../domain/user/types";

export type GardenRepo = {
  /**
   * Returns the user's garden, creating an empty one on the first read so
   * services don't need to special-case "no garden yet".
   */
  getOrCreate(userId: UserId): Promise<GardenState>;
  update(garden: GardenState): Promise<GardenState>;
};
