import { describe, expect, it } from "vitest";

import { DomainError } from "../errors";
import type { User } from "../user/types";
import { emptyWheel, lockPriorities, wheelTotal, WHEEL_BUDGET } from "../user/wheel";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    name: "Ada",
    createdAt: 0,
    shopCoins: 0,
    totalCoinsEarned: 0,
    streak: 0,
    wheelOfLife: emptyWheel(),
    prioritiesLocked: false,
    ...overrides,
  };
}

describe("wheelTotal", () => {
  it("sums all area weights", () => {
    expect(
      wheelTotal({
        health: 5,
        career: 5,
        finances: 5,
        relationships: 5,
        personal: 5,
        fun: 3,
        spirituality: 2,
      }),
    ).toBe(30);
  });
});

describe("lockPriorities", () => {
  it("locks the wheel and writes the values", () => {
    const user = makeUser();
    const wheel = {
      health: 10,
      career: 5,
      finances: 5,
      relationships: 5,
      personal: 0,
      fun: 5,
      spirituality: 0,
    };
    const next = lockPriorities(user, wheel);
    expect(next.prioritiesLocked).toBe(true);
    expect(next.wheelOfLife).toEqual(wheel);
  });

  it("rejects a wheel that exceeds the budget", () => {
    const user = makeUser();
    const wheel = {
      health: WHEEL_BUDGET,
      career: 1,
      finances: 0,
      relationships: 0,
      personal: 0,
      fun: 0,
      spirituality: 0,
    };
    expect(() => lockPriorities(user, wheel)).toThrow(DomainError);
  });

  it("rejects a second lock", () => {
    const user = makeUser({ prioritiesLocked: true });
    expect(() => lockPriorities(user, emptyWheel())).toThrow(DomainError);
  });
});
