import { beforeEach, describe, expect, it } from "vitest";

import { GET as GET_GARDEN } from "@/app/api/garden/route";
import { POST as PLANT_TILE } from "@/app/api/garden/tiles/route";
import { POST as CREATE_GOAL } from "@/app/api/goals/route";

import { freshTestContext, jsonRequest } from "../helpers/test-context";
import { signIn } from "../helpers/sign-in";

async function makeGoal(title = "Run a 5K") {
  const res = await CREATE_GOAL(jsonRequest("POST", { title, area: "health" }));
  return res.json();
}

describe("/api/garden", () => {
  beforeEach(freshTestContext);

  it("GET returns an empty 8x6 garden for a fresh user", async () => {
    await signIn("Ada");
    const res = await GET_GARDEN();
    const body = await res.json();
    expect(body.decoGrid).toHaveLength(8);
    expect(body.decoGrid[0]).toHaveLength(6);
    expect(body.owned).toEqual([]);
  });

  it("plants a goal on a free tile", async () => {
    await signIn("Ada");
    const goal = await makeGoal();
    const res = await PLANT_TILE(jsonRequest("POST", { goalId: goal.id, col: 2, row: 3 }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.decoGrid[2][3]).toEqual({ kind: "plant", goalId: goal.id });
  });

  it("rejects an occupied tile with 409", async () => {
    await signIn("Ada");
    const a = await makeGoal("A");
    const b = await makeGoal("B");
    await PLANT_TILE(jsonRequest("POST", { goalId: a.id, col: 1, row: 1 }));
    const res = await PLANT_TILE(jsonRequest("POST", { goalId: b.id, col: 1, row: 1 }));
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe("TILE_OCCUPIED");
  });

  it("rejects out-of-bounds coordinates with 422", async () => {
    await signIn("Ada");
    const goal = await makeGoal();
    const res = await PLANT_TILE(jsonRequest("POST", { goalId: goal.id, col: 99, row: 0 }));
    expect(res.status).toBe(422);
  });

  it("returns 404 for a planted goal that doesn't belong to the user", async () => {
    await signIn("Ada");
    const goal = await makeGoal();
    await signIn("Bob");
    const res = await PLANT_TILE(jsonRequest("POST", { goalId: goal.id, col: 0, row: 0 }));
    expect(res.status).toBe(404);
  });
});
