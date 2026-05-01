import { describe, expect, it } from "vitest";

import { DomainError } from "../errors";
import {
  emptyDecoGrid,
  isTileFree,
  placeDeco,
  plantGoalOnTile,
  unplaceDeco,
  unplantGoalFromTile,
} from "../garden";
import type { GardenState } from "../types";

import { makeGoal } from "./fixtures";

function makeGarden(overrides: Partial<GardenState> = {}): GardenState {
  return {
    userId: "user_1",
    decoGrid: emptyDecoGrid(),
    owned: [],
    ...overrides,
  };
}

describe("plantGoalOnTile", () => {
  it("plants the goal on the tile and forces stage ≥ 1", () => {
    const goal = makeGoal({ stage: 0 });
    const garden = makeGarden();
    const result = plantGoalOnTile(goal, garden, 2, 3);
    expect(result.goal.planted).toBe(true);
    expect(result.goal.tileCol).toBe(2);
    expect(result.goal.tileRow).toBe(3);
    expect(result.goal.stage).toBe(1);
    const tile = result.garden.decoGrid[2]?.[3];
    expect(tile).toEqual({ kind: "plant", goalId: goal.id });
  });

  it("rejects out-of-bounds tiles", () => {
    const goal = makeGoal();
    const garden = makeGarden();
    expect(() => plantGoalOnTile(goal, garden, 8, 0)).toThrow(DomainError);
    expect(() => plantGoalOnTile(goal, garden, 0, 6)).toThrow(DomainError);
    expect(() => plantGoalOnTile(goal, garden, -1, 0)).toThrow(DomainError);
  });

  it("rejects tiles already holding a plant", () => {
    const goal1 = makeGoal({ id: "g1" });
    const goal2 = makeGoal({ id: "g2" });
    const garden = makeGarden();
    const after = plantGoalOnTile(goal1, garden, 1, 1);
    expect(() => plantGoalOnTile(goal2, after.garden, 1, 1)).toThrow(DomainError);
  });

  it("rejects an already-planted goal", () => {
    const goal = makeGoal({ planted: true, tileCol: 0, tileRow: 0 });
    const garden = makeGarden();
    expect(() => plantGoalOnTile(goal, garden, 1, 1)).toThrow(DomainError);
  });
});

describe("unplantGoalFromTile", () => {
  it("clears the tile and the planted flags", () => {
    const goal = makeGoal({ id: "g1" });
    const garden = makeGarden();
    const after = plantGoalOnTile(goal, garden, 4, 2);
    const removed = unplantGoalFromTile(after.goal, after.garden);
    expect(removed.goal.planted).toBe(false);
    expect(removed.goal.tileCol).toBeNull();
    expect(isTileFree(removed.garden, 4, 2)).toBe(true);
  });

  it("is a no-op for an unplanted goal", () => {
    const goal = makeGoal();
    const garden = makeGarden();
    const result = unplantGoalFromTile(goal, garden);
    expect(result.goal).toBe(goal);
    expect(result.garden).toBe(garden);
  });
});

describe("placeDeco / unplaceDeco", () => {
  it("places an owned decoration on a free tile", () => {
    const garden = makeGarden({ owned: ["fountain"] });
    const next = placeDeco(garden, 0, 0, "fountain");
    expect(next.decoGrid[0]?.[0]).toEqual({ kind: "deco", itemId: "fountain" });
  });

  it("rejects non-owned decorations", () => {
    const garden = makeGarden();
    expect(() => placeDeco(garden, 0, 0, "fountain")).toThrow(DomainError);
  });

  it("rejects occupied tiles", () => {
    const garden = makeGarden({ owned: ["fountain", "rock"] });
    const after = placeDeco(garden, 1, 1, "fountain");
    expect(() => placeDeco(after, 1, 1, "rock")).toThrow(DomainError);
  });

  it("rejects out-of-bounds coordinates", () => {
    const garden = makeGarden({ owned: ["fountain"] });
    expect(() => placeDeco(garden, 99, 0, "fountain")).toThrow(DomainError);
  });

  it("unplaceDeco clears a deco tile and ignores plant tiles", () => {
    const goal = makeGoal();
    let garden = makeGarden({ owned: ["fountain"] });
    garden = placeDeco(garden, 0, 0, "fountain");
    garden = plantGoalOnTile(goal, garden, 1, 0).garden;

    const afterDecoRemoved = unplaceDeco(garden, 0, 0);
    expect(afterDecoRemoved.decoGrid[0]?.[0]).toBeNull();

    const afterPlantSpot = unplaceDeco(garden, 1, 0);
    expect(afterPlantSpot.decoGrid[1]?.[0]).toEqual({ kind: "plant", goalId: goal.id });
  });
});
