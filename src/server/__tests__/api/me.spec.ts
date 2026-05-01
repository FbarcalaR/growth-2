import { beforeEach, describe, expect, it } from "vitest";

import { DELETE, GET, POST } from "@/app/api/me/route";
import { PATCH as PATCH_PRIORITIES } from "@/app/api/me/priorities/route";

import { freshTestContext, jsonRequest, signOut } from "../helpers/test-context";
import { signIn } from "../helpers/sign-in";

describe("/api/me", () => {
  beforeEach(freshTestContext);

  it("POST creates a user and sets the session cookie", async () => {
    const res = await POST(jsonRequest("POST", { name: "Ada Lovelace" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Ada Lovelace");
    expect(body.prioritiesLocked).toBe(false);

    // Subsequent GET should now return the same user.
    const me = await GET();
    expect(me.status).toBe(200);
    expect((await me.json()).id).toBe(body.id);
  });

  it("POST returns 422 on invalid body", async () => {
    const res = await POST(jsonRequest("POST", { name: "" }));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.code).toBe("INVALID_INPUT");
  });

  it("POST is idempotent for the same name (re-signs the same user in)", async () => {
    const first = await POST(jsonRequest("POST", { name: "Ada" }));
    const second = await POST(jsonRequest("POST", { name: "Ada" }));
    expect((await first.json()).id).toBe((await second.json()).id);
  });

  it("GET returns 401 with no session", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("DELETE clears the session — subsequent GET returns 401", async () => {
    await signIn("Ada");
    await DELETE();
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("GET returns 401 if the session points to a deleted user (manual sign-out edge)", async () => {
    await signIn("Ada");
    signOut();
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("/api/me/priorities", () => {
  beforeEach(freshTestContext);

  const validWheel = {
    health: 5,
    career: 5,
    finances: 5,
    relationships: 5,
    personal: 5,
    fun: 3,
    spirituality: 2,
  };

  it("PATCH locks the wheel and writes the values", async () => {
    await signIn("Ada");
    const res = await PATCH_PRIORITIES(jsonRequest("PATCH", { values: validWheel }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.prioritiesLocked).toBe(true);
    expect(body.wheelOfLife).toEqual(validWheel);
  });

  it("PATCH twice is rejected with 409 PRIORITIES_ALREADY_LOCKED", async () => {
    await signIn("Ada");
    await PATCH_PRIORITIES(jsonRequest("PATCH", { values: validWheel }));
    const res = await PATCH_PRIORITIES(jsonRequest("PATCH", { values: validWheel }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe("PRIORITIES_ALREADY_LOCKED");
  });

  it("PATCH rejects budgets over 30 with 422", async () => {
    await signIn("Ada");
    const overBudget = { ...validWheel, health: 50 };
    const res = await PATCH_PRIORITIES(jsonRequest("PATCH", { values: overBudget }));
    expect(res.status).toBe(422);
  });

  it("PATCH requires a session", async () => {
    const res = await PATCH_PRIORITIES(jsonRequest("PATCH", { values: validWheel }));
    expect(res.status).toBe(401);
  });
});
