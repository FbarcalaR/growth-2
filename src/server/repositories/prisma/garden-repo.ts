import "server-only";

import type { GardenTile as PrismaTile, OwnedDeco, Trophy } from "@prisma/client";

import { emptyDecoGrid } from "../../domain/garden/operations";
import type { GardenState, GardenTile } from "../../domain/garden/types";
import type { GardenRepo } from "../garden-repo";

import { prisma } from "./client";

const TROPHY_PREFIX = "trophy_";

/**
 * Build the public `GardenState` from the four physical tables that back it:
 *   • `garden_tiles`  → 8×6 grid of {plant|deco|null}
 *   • `owned_decos`   → flat list of deco ids the user has bought
 *   • `trophies`      → completed-goal trophies, one row per trophy
 *
 * The `garden.owned` field merges deco ids + `trophy_${goalId}` strings to
 * preserve the in-memory contract for callers (Story 4.4 trophy pill, the
 * deco shop sheet).
 */
async function loadGarden(userId: string): Promise<GardenState> {
  const [tiles, decos, trophies] = await Promise.all([
    prisma.gardenTile.findMany({ where: { userId } }),
    prisma.ownedDeco.findMany({ where: { userId } }),
    prisma.trophy.findMany({ where: { userId } }),
  ]);

  const decoGrid = emptyDecoGrid();
  for (const row of tiles) {
    const column = decoGrid[row.tileCol];
    if (!column) continue;
    column[row.tileRow] = tileRowToDomain(row);
  }

  return {
    userId,
    decoGrid,
    owned: [...decos.map((d: OwnedDeco) => d.decoId), ...trophies.map((t: Trophy) => t.id)],
  };
}

function tileRowToDomain(row: PrismaTile): GardenTile {
  if (row.kind === "plant" && row.goalId) return { kind: "plant", goalId: row.goalId };
  if (row.kind === "deco" && row.decoId) return { kind: "deco", itemId: row.decoId };
  return null;
}

export function createPrismaGardenRepo(): GardenRepo {
  return {
    async getOrCreate(userId) {
      // No "create empty garden" row — empty state is the absence of tiles /
      // decos / trophies. Just read what's there.
      return loadGarden(userId);
    },

    async update(garden) {
      // Replace-the-set semantics: walk the incoming `decoGrid` + `owned`
      // and rewrite the three tables atomically. Same trade-off as
      // goal-repo's task/routine reset — small N, simple to reason about.
      await prisma.$transaction(async (tx) => {
        await tx.gardenTile.deleteMany({ where: { userId: garden.userId } });
        const newTiles: {
          tileCol: number;
          tileRow: number;
          kind: string;
          goalId: string | null;
          decoId: string | null;
        }[] = [];
        for (let col = 0; col < garden.decoGrid.length; col += 1) {
          const column = garden.decoGrid[col];
          if (!column) continue;
          for (let row = 0; row < column.length; row += 1) {
            const tile = column[row];
            if (!tile) continue;
            newTiles.push({
              tileCol: col,
              tileRow: row,
              kind: tile.kind,
              goalId: tile.kind === "plant" ? tile.goalId : null,
              decoId: tile.kind === "deco" ? tile.itemId : null,
            });
          }
        }
        if (newTiles.length > 0) {
          await tx.gardenTile.createMany({
            data: newTiles.map((t) => ({ ...t, userId: garden.userId })),
          });
        }

        // Split `owned` into deco-ids vs trophy-ids by prefix; update the two
        // tables separately. Trophies must be linked back to a goal — if the
        // goal is missing (legacy import, race) we silently skip.
        const decoIds = garden.owned.filter((id) => !id.startsWith(TROPHY_PREFIX));
        const trophyIds = garden.owned.filter((id) => id.startsWith(TROPHY_PREFIX));

        await tx.ownedDeco.deleteMany({ where: { userId: garden.userId } });
        if (decoIds.length > 0) {
          await tx.ownedDeco.createMany({
            data: decoIds.map((decoId) => ({ userId: garden.userId, decoId })),
            skipDuplicates: true,
          });
        }

        await tx.trophy.deleteMany({ where: { userId: garden.userId } });
        for (const trophyId of trophyIds) {
          const goalId = trophyId.slice(TROPHY_PREFIX.length);
          // Trophy → Goal FK: skip if the goal isn't there (e.g. legacy data
          // imported before its goal was inserted in the same transaction).
          const goal = await tx.goal.findFirst({
            where: { id: goalId, userId: garden.userId },
            select: { id: true },
          });
          if (!goal) continue;
          await tx.trophy.create({
            data: { id: trophyId, userId: garden.userId, goalId },
          });
        }
      });
      return loadGarden(garden.userId);
    },
  };
}
