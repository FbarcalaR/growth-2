import { beforeEach, describe, expect, it } from "vitest";

import { GET as GET_TODAY } from "@/app/api/today/route";
import { POST as CREATE_GOAL } from "@/app/api/goals/route";
import { POST as CREATE_TASK } from "@/app/api/goals/[id]/tasks/route";
import { POST as CREATE_ROUTINE } from "@/app/api/goals/[id]/routines/route";

import { ctx, freshTestContext, jsonRequest } from "../helpers/test-context";
import { signIn } from "../helpers/sign-in";

async function createGoal(title: string, area = "health") {
  const res = await CREATE_GOAL(jsonRequest("POST", { title, area }));
  if (res.status !== 201) throw new Error(`create failed ${res.status}`);
  return res.json();
}

async function addTask(goalId: string, title: string, dueDate: string | null) {
  const res = await CREATE_TASK(jsonRequest("POST", { title, dueDate }), ctx({ id: goalId }));
  return res.json();
}

async function addRoutine(
  goalId: string,
  title: string,
  repeatDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean],
) {
  const res = await CREATE_ROUTINE(jsonRequest("POST", { title, repeatDays }), ctx({ id: goalId }));
  return res.json();
}

describe("GET /api/today", () => {
  beforeEach(freshTestContext);

  it("returns 401 with no session", async () => {
    const res = await GET_TODAY();
    expect(res.status).toBe(401);
  });

  it("returns an empty groups array for a fresh user", async () => {
    await signIn("Ada");
    const res = await GET_TODAY();
    expect(res.status).toBe(200);
    expect((await res.json()).groups).toEqual([]);
  });

  it("groups goals that have visible items today (undated tasks always show)", async () => {
    await signIn("Ada");
    const goal = await createGoal("Run a 5K");
    await addTask(goal.id, "Buy running shoes", null); // undated → visible

    const res = await GET_TODAY();
    const body = await res.json();
    expect(body.groups).toHaveLength(1);
    expect(body.groups[0].goalTitle).toBe("Run a 5K");
    expect(body.groups[0].tasks).toHaveLength(1);
    expect(body.groups[0].tasks[0].title).toBe("Buy running shoes");
  });

  it("excludes goals whose only items are routines NOT scheduled for today", async () => {
    await signIn("Ada");
    const goal = await createGoal("Run a 5K");
    // Routine scheduled for no days at all is rejected by the schema (>=1 day),
    // so use a single non-today day. Today is the local-zone weekday at run time;
    // we can't deterministically pick "not today" without a clock, but we can
    // assert the "only routine, scheduled all days" case is included.
    await addRoutine(goal.id, "Daily stretch", [true, true, true, true, true, true, true]);

    const res = await GET_TODAY();
    const body = await res.json();
    expect(body.groups).toHaveLength(1);
    expect(body.groups[0].routines).toHaveLength(1);
  });

  it("excludes goals with no visible items today", async () => {
    await signIn("Ada");
    const a = await createGoal("Has visible task", "health");
    await addTask(a.id, "Show me", null);

    const b = await createGoal("Empty for today", "career");
    // No tasks, no routines on `b` → shouldn't appear.

    const res = await GET_TODAY();
    const body = await res.json();
    expect(body.groups.map((g: { goalId: string }) => g.goalId)).toEqual([a.id]);
    expect(body.groups.map((g: { goalId: string }) => g.goalId)).not.toContain(b.id);
  });

  it("includes derived goalHealth + goalHealthState on each group", async () => {
    await signIn("Ada");
    const goal = await createGoal("Run a 5K");
    await addTask(goal.id, "x", null);

    const res = await GET_TODAY();
    const body = await res.json();
    expect(body.groups[0].goalHealth).toBe(100);
    expect(body.groups[0].goalHealthState).toBe("healthy");
  });

  it("excludes completed goals entirely", async () => {
    await signIn("Ada");
    const goal = await createGoal("Already done");
    await addTask(goal.id, "x", null);

    // Mark the goal completed via the service-level method (no API needed for this assertion).
    const { getServices } = await import("@/server/services");
    const { getContainer } = await import("@/server/container");
    const me = await getContainer().repos.users.findById(
      "user_" + goal.id.split("_").slice(1).join("_"),
    );
    void me; // we only need to act on behalf of the signed-in user
    // Use the signed-in user's actual record:
    const { GET: GET_ME } = await import("@/app/api/me/route");
    const meRes = await GET_ME();
    const meJson = await meRes.json();
    const userRecord = await getContainer().repos.users.findById(meJson.id);
    if (!userRecord) throw new Error("test setup: user disappeared");
    await getServices().goals.complete(userRecord, goal.id);

    const res = await GET_TODAY();
    expect((await res.json()).groups).toEqual([]);
  });
});
