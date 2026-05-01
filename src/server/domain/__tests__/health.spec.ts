import { describe, expect, it } from "vitest";

import { addDaysISO, frozenClock, toISODate } from "../clock";
import { getGoalHealthState, getHealth, getHealthState, getOverdueCount } from "../health";

import { makeGoal } from "./fixtures";

const NOW = new Date("2026-05-01T12:00:00");
const TODAY = toISODate(NOW);

describe("getOverdueCount", () => {
  it("returns 0 when no tasks exist", () => {
    const goal = makeGoal();
    expect(getOverdueCount(goal, NOW)).toBe(0);
  });

  it("ignores completed and undated tasks", () => {
    const goal = makeGoal({
      tasks: [
        { id: "t1", title: "x", completed: true, dueDate: addDaysISO(TODAY, -10) },
        { id: "t2", title: "x", completed: false, dueDate: null },
      ],
    });
    expect(getOverdueCount(goal, NOW)).toBe(0);
  });

  it("ignores tasks due today or in the future", () => {
    const goal = makeGoal({
      tasks: [
        { id: "t1", title: "x", completed: false, dueDate: TODAY },
        { id: "t2", title: "x", completed: false, dueDate: addDaysISO(TODAY, 1) },
      ],
    });
    expect(getOverdueCount(goal, NOW)).toBe(0);
  });

  it("counts each overdue task once", () => {
    const goal = makeGoal({
      tasks: [
        { id: "t1", title: "x", completed: false, dueDate: addDaysISO(TODAY, -1) },
        { id: "t2", title: "x", completed: false, dueDate: addDaysISO(TODAY, -2) },
      ],
    });
    expect(getOverdueCount(goal, NOW)).toBe(2);
  });

  it("double-counts tasks more than 7 days overdue", () => {
    const goal = makeGoal({
      tasks: [{ id: "t1", title: "x", completed: false, dueDate: addDaysISO(TODAY, -8) }],
    });
    expect(getOverdueCount(goal, NOW)).toBe(2);
  });

  it("adds 0.5 for routines with streak 0 that are scheduled at all", () => {
    const goal = makeGoal({
      routines: [
        {
          id: "r1",
          title: "stretch",
          completedToday: false,
          streak: 0,
          repeatDays: [true, true, true, true, true, true, true],
        },
      ],
    });
    expect(getOverdueCount(goal, NOW)).toBe(0.5);
  });

  it("does not penalise a routine with an active streak", () => {
    const goal = makeGoal({
      routines: [
        {
          id: "r1",
          title: "stretch",
          completedToday: true,
          streak: 5,
          repeatDays: [true, true, true, true, true, true, true],
        },
      ],
    });
    expect(getOverdueCount(goal, NOW)).toBe(0);
  });
});

describe("getHealth (overdue weight → 0..100)", () => {
  it.each([
    [0, 100],
    [0.5, 70], // any non-zero overdue weight tips into wilting (a slipped routine counts)
    [1, 70],
    [2, 40],
    [3, 15],
    [4, 0],
    [10, 0],
  ])("overdue=%s → health=%s", (overdue, expected) => {
    expect(getHealth(overdue)).toBe(expected);
  });
});

describe("getHealthState (health → label)", () => {
  it.each([
    [100, "healthy"],
    [70, "wilting"],
    [40, "ill"],
    [15, "critical"],
    [0, "dead"],
  ] as const)("health=%s → state=%s", (health, expected) => {
    expect(getHealthState(health)).toBe(expected);
  });
});

describe("getGoalHealthState (clock-injected end-to-end)", () => {
  it("flips to wilting when one task slips past today", () => {
    const clock = frozenClock(NOW);
    const goal = makeGoal({
      tasks: [{ id: "t1", title: "x", completed: false, dueDate: addDaysISO(TODAY, -1) }],
    });
    expect(getGoalHealthState(goal, clock.now())).toBe("wilting");
  });

  it("declares the plant dead at 4+ overdue weight", () => {
    const clock = frozenClock(NOW);
    const goal = makeGoal({
      tasks: [
        { id: "t1", title: "x", completed: false, dueDate: addDaysISO(TODAY, -1) },
        { id: "t2", title: "x", completed: false, dueDate: addDaysISO(TODAY, -2) },
        { id: "t3", title: "x", completed: false, dueDate: addDaysISO(TODAY, -10) }, // counts as 2
      ],
    });
    expect(getGoalHealthState(goal, clock.now())).toBe("dead");
  });
});
