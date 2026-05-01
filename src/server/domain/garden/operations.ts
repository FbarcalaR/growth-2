import { DomainError } from "../errors";
import type { Goal } from "../goal/types";

import type { DecoId, GardenState, GardenTile } from "./types";
import { GARDEN_COLS, GARDEN_ROWS } from "./types";

export function emptyDecoGrid(): GardenTile[][] {
  return Array.from({ length: GARDEN_COLS }, () => Array(GARDEN_ROWS).fill(null));
}

function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < GARDEN_COLS && row >= 0 && row < GARDEN_ROWS;
}

function getTile(garden: GardenState, col: number, row: number): GardenTile {
  return garden.decoGrid[col]?.[row] ?? null;
}

function withTile(garden: GardenState, col: number, row: number, tile: GardenTile): GardenState {
  const decoGrid = garden.decoGrid.map((c) => [...c]);
  const column = decoGrid[col];
  if (!column) throw new DomainError("TILE_OUT_OF_BOUNDS");
  column[row] = tile;
  return { ...garden, decoGrid };
}

/**
 * Plant a goal on a tile. Updates the goal AND writes a `plant` tile into the
 * garden. Caller is responsible for persisting both.
 *
 * Rejects: out-of-bounds tile, occupied tile, already-planted goal.
 */
export function plantGoalOnTile(
  goal: Goal,
  garden: GardenState,
  col: number,
  row: number,
): { goal: Goal; garden: GardenState } {
  if (goal.completed) throw new DomainError("GOAL_ALREADY_COMPLETED");
  if (goal.planted) throw new DomainError("GOAL_ALREADY_PLANTED");
  if (!inBounds(col, row)) throw new DomainError("TILE_OUT_OF_BOUNDS");
  if (getTile(garden, col, row) !== null) throw new DomainError("TILE_OCCUPIED");

  const nextGoal: Goal = {
    ...goal,
    planted: true,
    tileCol: col,
    tileRow: row,
    stage: goal.stage === 0 ? 1 : goal.stage,
  };
  const nextGarden = withTile(garden, col, row, { kind: "plant", goalId: goal.id });
  return { goal: nextGoal, garden: nextGarden };
}

/**
 * Remove a planted goal from its tile (e.g. on goal deletion or completion).
 * No-op if the goal isn't on a tile or the tile points elsewhere.
 */
export function unplantGoalFromTile(
  goal: Goal,
  garden: GardenState,
): { goal: Goal; garden: GardenState } {
  if (!goal.planted || goal.tileCol === null || goal.tileRow === null) {
    return { goal, garden };
  }
  const tile = getTile(garden, goal.tileCol, goal.tileRow);
  let nextGarden = garden;
  if (tile && tile.kind === "plant" && tile.goalId === goal.id) {
    nextGarden = withTile(garden, goal.tileCol, goal.tileRow, null);
  }
  const nextGoal: Goal = { ...goal, planted: false, tileCol: null, tileRow: null };
  return { goal: nextGoal, garden: nextGarden };
}

/**
 * Place a decoration on a free tile. Rejects out-of-bounds or occupied tiles,
 * and decorations the user doesn't own.
 */
export function placeDeco(
  garden: GardenState,
  col: number,
  row: number,
  itemId: DecoId,
): GardenState {
  if (!inBounds(col, row)) throw new DomainError("TILE_OUT_OF_BOUNDS");
  if (!garden.owned.includes(itemId)) throw new DomainError("DECO_NOT_OWNED");
  if (getTile(garden, col, row) !== null) throw new DomainError("TILE_OCCUPIED");

  return withTile(garden, col, row, { kind: "deco", itemId });
}

export function unplaceDeco(garden: GardenState, col: number, row: number): GardenState {
  if (!inBounds(col, row)) throw new DomainError("TILE_OUT_OF_BOUNDS");
  const tile = getTile(garden, col, row);
  if (!tile || tile.kind !== "deco") return garden;
  return withTile(garden, col, row, null);
}

export function isTileFree(garden: GardenState, col: number, row: number): boolean {
  return inBounds(col, row) && getTile(garden, col, row) === null;
}
