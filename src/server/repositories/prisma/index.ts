import "server-only";

import type { Repositories } from "..";
import { createInMemoryShopRepo } from "../memory/shop-repo";

import { createPrismaCompletionRepo } from "./completion-repo";
import { createPrismaGardenRepo } from "./garden-repo";
import { createPrismaGoalRepo } from "./goal-repo";
import { createPrismaUserRepo } from "./user-repo";

/**
 * Postgres-backed repository factory (Epic A). The shop catalog stays
 * memory-resident — it's static config, no per-user state — so both impls
 * point at the same `createInMemoryShopRepo`.
 */
export function createPrismaRepositories(): Repositories {
  return {
    users: createPrismaUserRepo(),
    goals: createPrismaGoalRepo(),
    gardens: createPrismaGardenRepo(),
    completions: createPrismaCompletionRepo(),
    shop: createInMemoryShopRepo(),
  };
}

export {
  createPrismaCompletionRepo,
  createPrismaGardenRepo,
  createPrismaGoalRepo,
  createPrismaUserRepo,
};
