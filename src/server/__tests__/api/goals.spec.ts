import { beforeEach, describe, expect, it } from "vitest";

import {
  DELETE as DELETE_GOAL,
  GET as GET_GOAL,
  PATCH as PATCH_GOAL,
} from "@/app/api/goals/[id]/route";
import { GET as LIST_GOALS, POST as CREATE_GOAL } from "@/app/api/goals/route";

import { ctx, freshTestContext, jsonRequest } from "../helpers/test-context";
import { signIn } from "../helpers/sign-in";

async function createGoal(title: string, area = "health") {
  const res = await CREATE_GOAL(jsonRequest("POST", { title, area }));
  if (res.status !== 201) throw new Error(`create failed ${res.status}`);
  return res.json();
}

describe("/api/goals", () => {
  beforeEach(freshTestContext);

  it("rejects unauthenticated requests with 401", async () => {
    const res = await LIST_GOALS();
    expect(res.status).toBe(401);
  });

  it("GET returns an empty list for a fresh user", async () => {
    await signIn("Ada");
    const res = await LIST_GOALS();
    const body = await res.json();
    expect(body.goals).toEqual([]);
  });

  it("POST creates a goal and GET lists it", async () => {
    await signIn("Ada");
    const goal = await createGoal("Run a 5K");
    const list = await (await LIST_GOALS()).json();
    expect(list.goals).toHaveLength(1);
    expect(list.goals[0].id).toBe(goal.id);
    expect(list.goals[0].plantType).toBe("herb");
    expect(list.goals[0].healthState).toBe("healthy");
  });

  it("POST 422 on invalid input (missing title)", async () => {
    await signIn("Ada");
    const res = await CREATE_GOAL(jsonRequest("POST", { area: "health" }));
    expect(res.status).toBe(422);
  });

  it("PATCH updates a goal", async () => {
    await signIn("Ada");
    const goal = await createGoal("Run a 5K");
    const res = await PATCH_GOAL(
      jsonRequest("PATCH", { title: "Run a 10K" }),
      ctx({ id: goal.id }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Run a 10K");
  });

  it("DELETE removes a goal", async () => {
    await signIn("Ada");
    const goal = await createGoal("Run a 5K");
    const res = await DELETE_GOAL(jsonRequest("DELETE"), ctx({ id: goal.id }));
    expect(res.status).toBe(204);
    const list = await (await LIST_GOALS()).json();
    expect(list.goals).toEqual([]);
  });

  it("returns 404 for goals belonging to another user", async () => {
    await signIn("Ada");
    const goal = await createGoal("Run a 5K");

    // Switch to a different user.
    await signIn("Bob");
    const res = await GET_GOAL(jsonRequest("GET"), ctx({ id: goal.id }));
    expect(res.status).toBe(404);
  });
});
