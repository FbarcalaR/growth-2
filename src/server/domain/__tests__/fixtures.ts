import type { Goal } from "../goal/types";

let counter = 0;
function nextId(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${counter}`;
}

export function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: nextId("goal"),
    userId: "user_1",
    title: "Run a 5K race",
    area: "health",
    plantType: "herb",
    stage: 1,
    plantRes: {},
    planted: false,
    tileCol: null,
    tileRow: null,
    tasks: [],
    routines: [],
    ...overrides,
  };
}
