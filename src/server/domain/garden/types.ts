import type { GoalId } from "../goal/types";
import type { UserId } from "../user/types";

export type DecoId = string;

export type GardenTile =
  | { kind: "plant"; goalId: GoalId }
  | { kind: "deco"; itemId: DecoId }
  | null;

export type GardenState = {
  userId: UserId;
  /** Fixed 8 columns × 6 rows. */
  decoGrid: GardenTile[][];
  owned: DecoId[];
};

export const GARDEN_COLS = 8;
export const GARDEN_ROWS = 6;

export type DecoRarity = "common" | "rare" | "epic" | "legendary";

export type DecoItem = {
  id: DecoId;
  name: string;
  cost: number;
  emoji: string;
  rarity: DecoRarity;
};
