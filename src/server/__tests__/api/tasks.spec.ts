import { beforeEach, describe, expect, it } from "vitest";

import { POST as CREATE_TASK } from "@/app/api/goals/[id]/tasks/route";
import {
  DELETE as DELETE_TASK,
  PATCH as PATCH_TASK,
} from "@/app/api/goals/[id]/tasks/[taskId]/route";
import { POST as CREATE_GOAL } from "@/app/api/goals/route";
import { GET as GET_ME } from "@/app/api/me/route";

import { ctx, freshTestContext, jsonRequest } from "../helpers/test-context";
import { signIn } from "../helpers/sign-in";

async function setup() {
  await signIn("Ada");
  const goalRes = await CREATE_GOAL(jsonRequest("POST", { title: "Run a 5K", area: "health" }));
  const goal = await goalRes.json();
  const taskRes = await CREATE_TASK(
    jsonRequest("POST", { title: "Buy running shoes", dueDate: null }),
    ctx({ id: goal.id }),
  );
  const goalAfterTask = await taskRes.json();
  const task = goalAfterTask.tasks[0];
  return { goal, task };
}

describe("PATCH /api/goals/:id/tasks/:taskId — toggle completion", () => {
  beforeEach(freshTestContext);

  it("flips completed=true and credits coins + the area's primary resource", async () => {
    const { goal, task } = await setup();

    const res = await PATCH_TASK(
      jsonRequest("PATCH", { completed: true }),
      ctx({ id: goal.id, taskId: task.id }),
    );
    expect(res.status).toBe(200);
    const { goal: updatedGoal, user } = await res.json();
    expect(updatedGoal.tasks[0].completed).toBe(true);
    expect(updatedGoal.plantRes.water).toBe(4); // health area → water
    expect(user.shopCoins).toBe(3);
    expect(user.totalCoinsEarned).toBe(3);
  });

  it("uncompleting refunds coins (not below 0) and floors resources", async () => {
    const { goal, task } = await setup();
    await PATCH_TASK(
      jsonRequest("PATCH", { completed: true }),
      ctx({ id: goal.id, taskId: task.id }),
    );
    const res = await PATCH_TASK(
      jsonRequest("PATCH", { completed: false }),
      ctx({ id: goal.id, taskId: task.id }),
    );
    const { goal: updatedGoal, user } = await res.json();
    expect(updatedGoal.tasks[0].completed).toBe(false);
    expect(updatedGoal.plantRes.water ?? 0).toBe(0);
    expect(user.shopCoins).toBe(0);
  });

  it("returns 404 for an unknown taskId", async () => {
    const { goal } = await setup();
    const res = await PATCH_TASK(
      jsonRequest("PATCH", { completed: true }),
      ctx({ id: goal.id, taskId: "nope" }),
    );
    expect(res.status).toBe(404);
  });

  it("DELETE removes the task", async () => {
    const { goal, task } = await setup();
    const res = await DELETE_TASK(jsonRequest("DELETE"), ctx({ id: goal.id, taskId: task.id }));
    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.tasks).toHaveLength(0);
  });

  it("editing title alongside toggling completion both lands in one request", async () => {
    const { goal, task } = await setup();
    const res = await PATCH_TASK(
      jsonRequest("PATCH", { completed: true, title: "renamed" }),
      ctx({ id: goal.id, taskId: task.id }),
    );
    const { goal: updatedGoal } = await res.json();
    expect(updatedGoal.tasks[0].completed).toBe(true);
    expect(updatedGoal.tasks[0].title).toBe("renamed");
  });

  it("user totals persist — GET /api/me reflects accrued coins", async () => {
    const { goal, task } = await setup();
    await PATCH_TASK(
      jsonRequest("PATCH", { completed: true }),
      ctx({ id: goal.id, taskId: task.id }),
    );
    const me = await (await GET_ME()).json();
    expect(me.shopCoins).toBe(3);
  });
});
