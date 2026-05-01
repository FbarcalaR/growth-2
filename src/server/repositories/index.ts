import type { GardenRepo } from "./garden-repo";
import type { GoalRepo } from "./goal-repo";
import type { ShopRepo } from "./shop-repo";
import type { UserRepo } from "./user-repo";

/**
 * Aggregate of all repositories. Services receive this object and read the
 * specific repo they need. The composition root in `src/server/container.ts`
 * is the only place that instantiates a `Repositories`.
 */
export type Repositories = {
  users: UserRepo;
  goals: GoalRepo;
  gardens: GardenRepo;
  shop: ShopRepo;
};

export type { GardenRepo, GoalRepo, ShopRepo, UserRepo };
