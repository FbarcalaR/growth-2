import { beforeEach, describe, expect, it } from "vitest";

import { GET as GET_HISTORY } from "@/app/api/history/route";
import { POST as CREATE_GOAL } from "@/app/api/goals/route";
import { POST as CREATE_TASK } from "@/app/api/goals/[id]/tasks/route";
import { PATCH as PATCH_TASK } from "@/app/api/goals/[id]/tasks/[taskId]/route";
import { POST as COMPLETE_GOAL } from "@/app/api/goals/[id]/complete/route";
import { toISODate } from "@/server/domain/clock";

import { ctx, freshTestContext, getRequest, jsonRequest } from "../helpers/test-context";
import { signIn } from "../helpers/sign-in";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function createGoal(title: string, area = "health") {
  const res = await CREATE_GOAL(jsonRequest("POST", { title, area }));
  if (res.status !== 201) throw new Error(`create failed ${res.status}`);
  return res.json();
}

async function addTask(goalId: string, title: string, dueDate: string | null) {
  // POST /tasks returns the parent GoalDto (with the new task appended).
  const res = await CREATE_TASK(jsonRequest("POST", { title, dueDate }), ctx({ id: goalId }));
  const goal = await res.json();
  const taskId = goal.tasks[goal.tasks.length - 1].id as string;
  return taskId;
}

async function toggleTask(goalId: string, taskId: string, completed: boolean) {
  await PATCH_TASK(jsonRequest("PATCH", { completed }), ctx({ id: goalId, taskId }));
}

describe("GET /api/history", () => {
  beforeEach(freshTestContext);

  it("returns 401 with no session", async () => {
    const res = await GET_HISTORY(getRequest({ month: currentMonth() }));
    expect(res.status).toBe(401);
  });

  it("rejects missing or malformed month with 422", async () => {
    await signIn("Ada");
    const missing = await GET_HISTORY(getRequest());
    expect(missing.status).toBe(422);
    const bad = await GET_HISTORY(getRequest({ month: "2026/05" }));
    expect(bad.status).toBe(422);
  });

  it("returns one HistoryDay per day in the month with empty rollups for fresh users", async () => {
    await signIn("Ada");
    const month = currentMonth();
    const res = await GET_HISTORY(getRequest({ month }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.month).toBe(month);
    const [year, m] = month.split("-").map(Number);
    const expectedDays = new Date(year!, m!, 0).getDate();
    expect(body.days).toHaveLength(expectedDays);
    expect(body.summary).toEqual({
      perfectDays: 0,
      missedDays: 0,
      monthPct: 0,
      completedThisMonth: 0,
      scheduledThisMonth: 0,
      currentStreak: 0,
    });
    for (const day of body.days) {
      expect(day.completed).toEqual([]);
      expect(day.missed).toEqual([]);
      expect(day.planned).toEqual([]);
    }
  });

  it("places a completed task on today's `completed` list and the matching dueDate", async () => {
    await signIn("Ada");
    const today = toISODate(new Date());
    const goal = await createGoal("Run a 5K");
    const taskId = await addTask(goal.id, "Buy shoes", today);
    await toggleTask(goal.id, taskId, true);

    const res = await GET_HISTORY(getRequest({ month: currentMonth() }));
    const body = await res.json();
    const day = body.days.find((d: { date: string }) => d.date === today);
    expect(day.completed).toHaveLength(1);
    expect(day.completed[0]).toMatchObject({
      kind: "task",
      title: "Buy shoes",
      goalTitle: "Run a 5K",
      goalArea: "health",
    });
    expect(day.missed).toHaveLength(0);
    expect(day.planned).toHaveLength(0);
  });

  it("flags a future-dated task as `planned` (no missed before its due day)", async () => {
    await signIn("Ada");
    const today = new Date();
    const future = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    if (future.getMonth() !== today.getMonth()) {
      // End-of-month edge case — the future day belongs to the next month and
      // wouldn't appear in this month's response, so skip.
      return;
    }
    const futureIso = toISODate(future);
    const goal = await createGoal("Run a 5K");
    await addTask(goal.id, "Stretch", futureIso);

    const res = await GET_HISTORY(getRequest({ month: currentMonth() }));
    const body = await res.json();
    const day = body.days.find((d: { date: string }) => d.date === futureIso);
    expect(day.planned).toHaveLength(1);
    expect(day.completed).toHaveLength(0);
    expect(day.missed).toHaveLength(0);
  });

  it("appends a `goal` event when the user marks a goal complete", async () => {
    await signIn("Ada");
    const today = toISODate(new Date());
    const goal = await createGoal("Run a 5K");
    // Goal complete works even with no items — the rule is "all done" which
    // is vacuously true when there are none.
    const res = await COMPLETE_GOAL(jsonRequest("POST", null), ctx({ id: goal.id }));
    expect(res.status).toBe(200);

    const histRes = await GET_HISTORY(getRequest({ month: currentMonth() }));
    const body = await histRes.json();
    const day = body.days.find((d: { date: string }) => d.date === today);
    expect(day.completed).toHaveLength(1);
    expect(day.completed[0]).toMatchObject({
      kind: "goal",
      title: "Run a 5K",
      goalId: goal.id,
    });
  });
});
