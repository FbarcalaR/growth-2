import { describe, expect, it } from "vitest";

import { PLANT_DEFS } from "../plant/definitions";
import { growPlant, meetsRequirement } from "../plant/growth";

import { makeGoal } from "./fixtures";

describe("meetsRequirement", () => {
  it("is true when current covers each named cost", () => {
    expect(meetsRequirement({ water: 8, nutrients: 4 }, { water: 8, nutrients: 4 })).toBe(true);
    expect(meetsRequirement({ water: 10, nutrients: 5 }, { water: 8, nutrients: 4 })).toBe(true);
  });

  it("is false when any named resource is short", () => {
    expect(meetsRequirement({ water: 7, nutrients: 4 }, { water: 8, nutrients: 4 })).toBe(false);
    expect(meetsRequirement({ water: 8 }, { water: 8, nutrients: 4 })).toBe(false);
  });
});

describe("growPlant", () => {
  it("does not advance when requirements are not met", () => {
    const goal = makeGoal({ stage: 1, plantRes: { water: 0 } });
    expect(growPlant(goal).stage).toBe(1);
  });

  it("advances one stage when the next stage's requirement is met", () => {
    const def = PLANT_DEFS.herb;
    const goal = makeGoal({ stage: 1, plantRes: { ...def.requirements[1] } });
    expect(growPlant(goal).stage).toBe(2);
  });

  it("advances multiple stages when accumulated resources cover several thresholds", () => {
    // Herb stage-3 requirements: water 28, nutrients 14. Provide enough for stage 3.
    const goal = makeGoal({ stage: 1, plantRes: { water: 30, nutrients: 16 } });
    expect(growPlant(goal).stage).toBe(3);
  });

  it("caps at the blooming stage (4)", () => {
    const goal = makeGoal({ stage: 1, plantRes: { water: 1000, nutrients: 1000 } });
    expect(growPlant(goal).stage).toBe(4);
  });

  it("is idempotent — calling twice produces the same result", () => {
    const def = PLANT_DEFS.herb;
    const goal = makeGoal({ stage: 1, plantRes: { ...def.requirements[1] } });
    const once = growPlant(goal);
    const twice = growPlant(once);
    expect(twice).toBe(once);
  });

  it("returns the same instance when nothing changes", () => {
    const goal = makeGoal({ stage: 1, plantRes: {} });
    expect(growPlant(goal)).toBe(goal);
  });

  it("does not advance a completed goal", () => {
    const goal = makeGoal({
      stage: 4,
      plantRes: { water: 1000, nutrients: 1000 },
      completed: true,
    });
    expect(growPlant(goal)).toBe(goal);
  });
});
