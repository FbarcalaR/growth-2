import type { Repositories } from "..";

import { createInMemoryGardenRepo } from "./garden-repo";
import { createInMemoryGoalRepo } from "./goal-repo";
import { createInMemoryShopRepo } from "./shop-repo";
import { createInMemoryUserRepo } from "./user-repo";

export function createInMemoryRepositories(): Repositories {
  return {
    users: createInMemoryUserRepo(),
    goals: createInMemoryGoalRepo(),
    gardens: createInMemoryGardenRepo(),
    shop: createInMemoryShopRepo(),
  };
}

export {
  createInMemoryGardenRepo,
  createInMemoryGoalRepo,
  createInMemoryShopRepo,
  createInMemoryUserRepo,
};
