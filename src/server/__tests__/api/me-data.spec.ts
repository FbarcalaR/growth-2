import { beforeEach, describe, expect, it } from "vitest";

import { GET as GET_ME } from "@/app/api/me/route";
import { POST as POST_RESET } from "@/app/api/me/reset/route";
import { POST as CREATE_GOAL } from "@/app/api/goals/route";
import { POST as CREATE_TASK } from "@/app/api/goals/[id]/tasks/route";
import { PATCH as PATCH_TASK } from "@/app/api/goals/[id]/tasks/[taskId]/route";
import { PATCH as PATCH_PRIORITIES } from "@/app/api/me/priorities/route";

import { ctx, freshTestContext, jsonRequest } from "../helpers/test-context";
import { signIn } from "../helpers/sign-in";

const validWheel = {
  health: 5,
  career: 5,
  finances: 5,
  relationships: 5,
  personal: 5,
  fun: 3,
  spirituality: 2,
};

async function createGoal(title: string, area = "health") {
  const res = await CREATE_GOAL(jsonRequest("POST", { title, area }));
  if (res.status !== 201) throw new Error(`create failed ${res.status}`);
  return res.json();
}

async function addTaskAndComplete(goalId: string, title: string) {
  const created = await CREATE_TASK(
    jsonRequest("POST", { title, dueDate: null }),
    ctx({ id: goalId }),
  );
  const goal = await created.json();
  const taskId = goal.tasks[goal.tasks.length - 1].id as string;
  await PATCH_TASK(jsonRequest("PATCH", { completed: true }), ctx({ id: goalId, taskId }));
}

describe("/api/me/reset", () => {
  beforeEach(freshTestContext);

  it("requires a session", async () => {
    const res = await POST_RESET();
    expect(res.status).toBe(401);
  });

  it("clears goals + completions and zeros wallet/wheel/priorities-locked", async () => {
    await signIn("Ada");
    await PATCH_PRIORITIES(jsonRequest("PATCH", { values: validWheel }));
    const goal = await createGoal("Run a 5K");
    await addTaskAndComplete(goal.id, "Buy shoes");

    const res = await POST_RESET();
    expect(res.status).toBe(200);
    const me = await res.json();
    expect(me.shopCoins).toBe(0);
    expect(me.totalCoinsEarned).toBe(0);
    expect(me.streak).toBe(0);
    expect(me.prioritiesLocked).toBe(false);
    expect(me.wheelOfLife).toEqual({
      health: 0,
      career: 0,
      finances: 0,
      relationships: 0,
      personal: 0,
      fun: 0,
      spirituality: 0,
    });

    // Subsequent GET reflects the reset.
    const after = await GET_ME();
    const afterMe = await after.json();
    expect(afterMe.id).toBe(me.id); // same user, still signed in
    expect(afterMe.name).toBe("Ada"); // identity preserved
  });
});
