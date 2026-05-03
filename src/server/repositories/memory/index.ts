import type { Repositories } from "..";

import { createInMemoryCompletionRepo } from "./completion-repo";
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
    completions: createInMemoryCompletionRepo(),
  };
}

export {
  createInMemoryCompletionRepo,
  createInMemoryGardenRepo,
  createInMemoryGoalRepo,
  createInMemoryShopRepo,
  createInMemoryUserRepo,
};
