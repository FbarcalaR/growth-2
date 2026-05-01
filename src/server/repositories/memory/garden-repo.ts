import { emptyDecoGrid } from "../../domain/garden/operations";
import type { GardenState } from "../../domain/garden/types";
import type { UserId } from "../../domain/user/types";
import type { GardenRepo } from "../garden-repo";

function clone(garden: GardenState): GardenState {
  return {
    ...garden,
    decoGrid: garden.decoGrid.map((c) => [...c]),
    owned: [...garden.owned],
  };
}

export function createInMemoryGardenRepo(): GardenRepo {
  const byUser = new Map<UserId, GardenState>();

  return {
    async getOrCreate(userId) {
      let garden = byUser.get(userId);
      if (!garden) {
        garden = { userId, decoGrid: emptyDecoGrid(), owned: [] };
        byUser.set(userId, garden);
      }
      return clone(garden);
    },

    async update(garden) {
      byUser.set(garden.userId, clone(garden));
      return clone(garden);
    },
  };
}
