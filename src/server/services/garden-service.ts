import "server-only";

import { type AppContainer } from "../container";
import { DomainError } from "../domain/errors";
import {
  placeDeco,
  plantGoalOnTile,
  unplaceDeco,
  unplantGoalFromTile,
} from "../domain/garden/operations";
import type { GardenState } from "../domain/garden/types";
import type { GoalId } from "../domain/goal/types";
import type { User } from "../domain/user/types";

export type GardenService = ReturnType<typeof createGardenService>;

export function createGardenService({ repos }: AppContainer) {
  return {
    get(user: User): Promise<GardenState> {
      return repos.gardens.getOrCreate(user.id);
    },

    async plantOnTile(
      user: User,
      goalId: GoalId,
      col: number,
      row: number,
    ): Promise<{ garden: GardenState }> {
      const goal = await repos.goals.findById(user.id, goalId);
      if (!goal) throw new DomainError("GOAL_NOT_FOUND");
      const garden = await repos.gardens.getOrCreate(user.id);
      const next = plantGoalOnTile(goal, garden, col, row);
      await repos.goals.update(next.goal);
      const persistedGarden = await repos.gardens.update(next.garden);
      return { garden: persistedGarden };
    },

    async unplant(user: User, goalId: GoalId): Promise<{ garden: GardenState }> {
      const goal = await repos.goals.findById(user.id, goalId);
      if (!goal) throw new DomainError("GOAL_NOT_FOUND");
      const garden = await repos.gardens.getOrCreate(user.id);
      const next = unplantGoalFromTile(goal, garden);
      await repos.goals.update(next.goal);
      const persistedGarden = await repos.gardens.update(next.garden);
      return { garden: persistedGarden };
    },

    async placeDeco(user: User, itemId: string, col: number, row: number): Promise<GardenState> {
      const garden = await repos.gardens.getOrCreate(user.id);
      const next = placeDeco(garden, col, row, itemId);
      return repos.gardens.update(next);
    },

    async unplaceDeco(user: User, col: number, row: number): Promise<GardenState> {
      const garden = await repos.gardens.getOrCreate(user.id);
      const next = unplaceDeco(garden, col, row);
      return repos.gardens.update(next);
    },
  };
}
