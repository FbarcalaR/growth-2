import { describe, expect, it } from "vitest";

import {
  GOAL_COMPLETION_BONUS,
  PERMANENT_ROUTINE_BONUS,
  ROUTINE_COIN_REWARD,
  ROUTINE_RESOURCE_REWARD,
  TASK_COIN_REWARD,
  TASK_RESOURCE_REWARD,
  routineCompletionReward,
  taskCompletionReward,
} from "../goal/rewards";

import { makeGoal } from "./fixtures";

describe("taskCompletionReward", () => {
  it("awards coins + the area's primary resource on completing", () => {
    const reward = taskCompletionReward("health", true);
    expect(reward.coins).toBe(TASK_COIN_REWARD);
    expect(reward.resources).toEqual({ water: TASK_RESOURCE_REWARD });
  });

  it("inverts the delta on uncompleting", () => {
    const reward = taskCompletionReward("finances", false);
    expect(reward.coins).toBe(-TASK_COIN_REWARD);
    expect(reward.resources).toEqual({ gold: -TASK_RESOURCE_REWARD });
  });
});

describe("routineCompletionReward", () => {
  it("awards coins + primary AND secondary resources for the plant kind", () => {
    const goal = makeGoal({ area: "health", plantType: "herb" });
    const reward = routineCompletionReward(goal, true);
    expect(reward.coins).toBe(ROUTINE_COIN_REWARD);
    expect(reward.resources).toEqual({
      water: ROUTINE_RESOURCE_REWARD,
      nutrients: ROUTINE_RESOURCE_REWARD,
    });
  });

  it("inverts the delta on uncompleting", () => {
    const goal = makeGoal({ area: "career", plantType: "sunflower" });
    const reward = routineCompletionReward(goal, false);
    expect(reward.coins).toBe(-ROUTINE_COIN_REWARD);
    expect(reward.resources).toEqual({
      sunlight: -ROUTINE_RESOURCE_REWARD,
      water: -ROUTINE_RESOURCE_REWARD,
    });
  });
});

describe("constants", () => {
  it("are the documented values", () => {
    expect(TASK_COIN_REWARD).toBe(3);
    expect(TASK_RESOURCE_REWARD).toBe(4);
    expect(ROUTINE_COIN_REWARD).toBe(2);
    expect(ROUTINE_RESOURCE_REWARD).toBe(2);
    expect(PERMANENT_ROUTINE_BONUS).toBe(5);
    expect(GOAL_COMPLETION_BONUS).toBe(50);
  });
});
