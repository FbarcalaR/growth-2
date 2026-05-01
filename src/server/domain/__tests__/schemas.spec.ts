import { describe, expect, it } from "vitest";

import { GardenStateSchema } from "../garden/schemas";
import { GoalSchema } from "../goal/schemas";
import { UserSchema } from "../user/schemas";

import { makeGoal } from "./fixtures";

describe("GoalSchema", () => {
  it("accepts a freshly-built goal fixture", () => {
    expect(GoalSchema.safeParse(makeGoal()).success).toBe(true);
  });

  it("rejects a missing area", () => {
    const bad = { ...makeGoal(), area: "not-a-real-area" };
    expect(GoalSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects out-of-range tile coordinates", () => {
    const bad = { ...makeGoal({ planted: true, tileCol: 99, tileRow: 0 }) };
    expect(GoalSchema.safeParse(bad).success).toBe(false);
  });
});

describe("UserSchema", () => {
  it("accepts a valid user", () => {
    const result = UserSchema.safeParse({
      id: "u1",
      name: "Ada",
      createdAt: 0,
      shopCoins: 0,
      totalCoinsEarned: 0,
      streak: 0,
      wheelOfLife: {
        health: 0,
        career: 0,
        finances: 0,
        relationships: 0,
        personal: 0,
        fun: 0,
        spirituality: 0,
      },
      prioritiesLocked: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative coin balances", () => {
    const result = UserSchema.safeParse({
      id: "u1",
      name: "Ada",
      createdAt: 0,
      shopCoins: -1,
      totalCoinsEarned: 0,
      streak: 0,
      wheelOfLife: {
        health: 0,
        career: 0,
        finances: 0,
        relationships: 0,
        personal: 0,
        fun: 0,
        spirituality: 0,
      },
      prioritiesLocked: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("GardenStateSchema", () => {
  it("accepts a fresh 8×6 grid", () => {
    const grid = Array.from({ length: 8 }, () => Array(6).fill(null));
    expect(GardenStateSchema.safeParse({ userId: "u1", decoGrid: grid, owned: [] }).success).toBe(
      true,
    );
  });

  it("rejects a grid with the wrong dimensions", () => {
    const grid = Array.from({ length: 6 }, () => Array(8).fill(null));
    expect(GardenStateSchema.safeParse({ userId: "u1", decoGrid: grid, owned: [] }).success).toBe(
      false,
    );
  });
});
