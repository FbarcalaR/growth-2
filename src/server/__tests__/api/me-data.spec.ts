import { beforeEach, describe, expect, it } from "vitest";

import { GET as GET_ME } from "@/app/api/me/route";
import { GET as GET_EXPORT } from "@/app/api/me/export/route";
import { POST as POST_IMPORT } from "@/app/api/me/import/route";
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

describe("/api/me/export", () => {
  beforeEach(freshTestContext);

  it("requires a session", async () => {
    const res = await GET_EXPORT();
    expect(res.status).toBe(401);
  });

  it("returns a versioned payload with goals + garden + completions", async () => {
    await signIn("Ada");
    const goal = await createGoal("Run a 5K");
    await addTaskAndComplete(goal.id, "Buy shoes");

    const res = await GET_EXPORT();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.version).toBe(1);
    expect(body.user.name).toBe("Ada");
    expect(body.goals).toHaveLength(1);
    expect(body.goals[0].title).toBe("Run a 5K");
    expect(body.completions.length).toBeGreaterThanOrEqual(1);
    expect(body.completions[0].kind).toBe("task");
    expect(body.garden).toBeDefined();
    expect(typeof body.exportedAt).toBe("number");
  });
});

describe("/api/me/import", () => {
  beforeEach(freshTestContext);

  it("requires a session", async () => {
    const res = await POST_IMPORT(jsonRequest("POST", { version: 1 }));
    expect(res.status).toBe(401);
  });

  it("rejects malformed payloads with 422", async () => {
    await signIn("Ada");
    const res = await POST_IMPORT(jsonRequest("POST", { version: 999 }));
    expect(res.status).toBe(422);
  });

  it("round-trips: export → reset → import puts the data back", async () => {
    const me = await signIn("Ada");
    await PATCH_PRIORITIES(jsonRequest("PATCH", { values: validWheel }));
    const goal = await createGoal("Run a 5K");
    await addTaskAndComplete(goal.id, "Buy shoes");

    const exportRes = await GET_EXPORT();
    const payload = await exportRes.json();

    await POST_RESET();
    const afterReset = await GET_ME();
    expect((await afterReset.json()).prioritiesLocked).toBe(false);

    const imported = await POST_IMPORT(jsonRequest("POST", payload));
    expect(imported.status).toBe(200);
    const restored = await imported.json();
    expect(restored.id).toBe(me.id);
    expect(restored.prioritiesLocked).toBe(true);
    expect(restored.wheelOfLife).toEqual(validWheel);

    // Goals + a completion should come back too.
    const exportAgain = await GET_EXPORT();
    const next = await exportAgain.json();
    expect(next.goals).toHaveLength(1);
    expect(next.goals[0].title).toBe("Run a 5K");
    expect(next.completions.length).toBeGreaterThanOrEqual(1);
    // IDs got regenerated (different from the original goal.id).
    expect(next.goals[0].id).not.toBe(goal.id);
  });

  it("clobbers any existing data — import is replace, not merge", async () => {
    await signIn("Ada");

    // Make a snapshot with one goal.
    const goalA = await createGoal("First snapshot goal");
    const exportA = await GET_EXPORT();
    const payloadA = await exportA.json();

    // Add another goal *after* the snapshot.
    await createGoal("Added later");
    const beforeImport = await GET_EXPORT();
    expect((await beforeImport.json()).goals).toHaveLength(2);

    // Importing the original snapshot drops the second goal.
    await POST_IMPORT(jsonRequest("POST", payloadA));
    const after = await GET_EXPORT();
    const afterPayload = await after.json();
    expect(afterPayload.goals).toHaveLength(1);
    expect(afterPayload.goals[0].title).toBe("First snapshot goal");
    // Restored goal carries a fresh id.
    expect(afterPayload.goals[0].id).not.toBe(goalA.id);
  });
});
