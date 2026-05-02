import "server-only";

import { getContainer } from "../container";

import { createGardenService } from "./garden-service";
import { createGoalService } from "./goal-service";
import { createShopService } from "./shop-service";
import { createTodayService } from "./today-service";
import { createUserService } from "./user-service";

export type Services = {
  users: ReturnType<typeof createUserService>;
  goals: ReturnType<typeof createGoalService>;
  gardens: ReturnType<typeof createGardenService>;
  shop: ReturnType<typeof createShopService>;
  today: ReturnType<typeof createTodayService>;
};

/**
 * Build the service layer from the current container. Route Handlers call this
 * once per request — it's cheap because it just wires functions over the
 * (cached) container.
 */
export function getServices(): Services {
  const container = getContainer();
  return {
    users: createUserService(container),
    goals: createGoalService(container),
    gardens: createGardenService(container),
    shop: createShopService(container),
    today: createTodayService(container),
  };
}

export {
  createGardenService,
  createGoalService,
  createShopService,
  createTodayService,
  createUserService,
};
