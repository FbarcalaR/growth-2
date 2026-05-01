import { describe, expect, it } from "vitest";

import { addDaysISO, frozenClock, toISODate } from "../clock";
import { DomainError } from "../errors";
import {
  applyRoutineCompletion,
  applyTaskCompletion,
  completeGoal,
  completeRoutinePermanently,
  replantGoal,
} from "../goals";

import { makeGoal } from "./fixtures";

const NOW = new Date("2026-05-01T12:00:00");
const TODAY = toISODate(NOW);

describe("applyTaskCompletion", () => {
  it("awards coins+resources and flips completed=true on completing", () => {
    const goal = makeGoal({
      area: "health",
      tasks: [{ id: "t1", title: "x", completed: false, dueDate: TODAY }],
    });
    const { goal: next, reward } = applyTaskCompletion(goal, "t1");
    expect(next.tasks[0]?.completed).toBe(true);
    expect(reward.coins).toBe(3);
    expect(reward.resources).toEqual({ water: 4 });
    expect(next.plantRes.water).toBe(4);
  });

  it("inverts on uncompleting (and floors resources at 0)", () => {
    const goal = makeGoal({
      plantRes: { water: 2 },
      tasks: [{ id: "t1", title: "x", completed: true, dueDate: TODAY }],
    });
    const { goal: next, reward } = applyTaskCompletion(goal, "t1");
    expect(next.tasks[0]?.completed).toBe(false);
    expect(reward.coins).toBe(-3);
    expect(next.plantRes.water).toBe(0);
  });

  it("triggers growPlant — completing enough tasks advances the stage", () => {
    // Herb stage 0→1 needs water=8, nutrients=4. Two task completions gives
    // water=8, but we still need nutrients=4 so it shouldn't advance from 1→2
    // off task completions alone. Use plantRes seed instead.
    const goal = makeGoal({
      area: "health",
      stage: 1,
      plantRes: { water: 12, nutrients: 8 }, // already meets stage-1 req of {water:16, nutrients:8}? no, water short by 4
      tasks: [{ id: "t1", title: "x", completed: false, dueDate: TODAY }],
    });
    const { goal: next } = applyTaskCompletion(goal, "t1");
    // water becomes 16, nutrients still 8 → stage advances 1→2
    expect(next.stage).toBe(2);
  });

  it("throws when the task isn't on the goal", () => {
    const goal = makeGoal();
    expect(() => applyTaskCompletion(goal, "missing")).toThrow(DomainError);
  });

  it("throws when the goal is already completed", () => {
    const goal = makeGoal({
      completed: true,
      tasks: [{ id: "t1", title: "x", completed: false, dueDate: null }],
    });
    expect(() => applyTaskCompletion(goal, "t1")).toThrow(DomainError);
  });
});

describe("applyRoutineCompletion", () => {
  const baseRoutine = {
    id: "r1",
    title: "stretch",
    completedToday: false,
    streak: 5,
    repeatDays: [true, true, true, true, true, true, true] as [
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
    ],
  };

  it("awards coins + primary AND secondary resources, bumps streak on completing", () => {
    const goal = makeGoal({ area: "health", plantType: "herb", routines: [baseRoutine] });
    const { goal: next, reward } = applyRoutineCompletion(goal, "r1");
    expect(next.routines[0]?.completedToday).toBe(true);
    expect(next.routines[0]?.streak).toBe(6);
    expect(reward.resources).toEqual({ water: 2, nutrients: 2 });
  });

  it("decrements streak on uncompleting (floored at 0)", () => {
    const goal = makeGoal({
      area: "health",
      plantType: "herb",
      routines: [{ ...baseRoutine, completedToday: true, streak: 0 }],
    });
    const { goal: next } = applyRoutineCompletion(goal, "r1");
    expect(next.routines[0]?.completedToday).toBe(false);
    expect(next.routines[0]?.streak).toBe(0);
  });
});

describe("completeRoutinePermanently", () => {
  it("flips permanentlyCompleted+completedToday and pays the bonus", () => {
    const goal = makeGoal({
      routines: [
        {
          id: "r1",
          title: "stretch",
          completedToday: false,
          streak: 3,
          repeatDays: [true, true, true, true, true, true, true],
        },
      ],
    });
    const { goal: next, reward } = completeRoutinePermanently(goal, "r1");
    expect(next.routines[0]?.permanentlyCompleted).toBe(true);
    expect(next.routines[0]?.completedToday).toBe(true);
    expect(reward.coins).toBe(5);
  });
});

describe("completeGoal", () => {
  it("awards 50 coins, sets stage=4, frees the tile, and stamps a trophyId", () => {
    const goal = makeGoal({ id: "g1", planted: true, tileCol: 2, tileRow: 3, stage: 3 });
    const { goal: next, trophyId, reward } = completeGoal(goal, NOW);
    expect(next.completed).toBe(true);
    expect(next.stage).toBe(4);
    expect(next.planted).toBe(false);
    expect(next.tileCol).toBeNull();
    expect(next.tileRow).toBeNull();
    expect(next.completedAt).toBe(NOW.getTime());
    expect(trophyId).toBe("trophy_g1");
    expect(next.trophyId).toBe("trophy_g1");
    expect(reward.coins).toBe(50);
  });

  it("throws if already completed", () => {
    const goal = makeGoal({ completed: true });
    expect(() => completeGoal(goal, NOW)).toThrow(DomainError);
  });
});

describe("replantGoal", () => {
  it("resets stage to 1, clears plant resources, reschedules overdue tasks to today", () => {
    const clock = frozenClock(NOW);
    const goal = makeGoal({
      stage: 0,
      plantRes: { water: 999, nutrients: 999 },
      tasks: [
        { id: "t1", title: "old", completed: false, dueDate: addDaysISO(TODAY, -10) },
        { id: "t2", title: "fresh", completed: false, dueDate: addDaysISO(TODAY, 3) },
        { id: "t3", title: "done", completed: true, dueDate: addDaysISO(TODAY, -5) },
      ],
    });
    const next = replantGoal(goal, clock.now());
    expect(next.stage).toBe(1);
    expect(next.plantRes).toEqual({});
    expect(next.tasks[0]?.dueDate).toBe(TODAY);
    expect(next.tasks[1]?.dueDate).toBe(addDaysISO(TODAY, 3));
    expect(next.tasks[2]?.dueDate).toBe(addDaysISO(TODAY, -5));
  });

  it("throws on a completed goal", () => {
    const goal = makeGoal({ completed: true });
    expect(() => replantGoal(goal, NOW)).toThrow(DomainError);
  });
});
