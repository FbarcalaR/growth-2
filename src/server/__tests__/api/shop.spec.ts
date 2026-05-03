import { beforeEach, describe, expect, it } from "vitest";

import { POST as BUY } from "@/app/api/shop/buy/route";
import { GET as LIST_SHOP } from "@/app/api/shop/route";

import { freshTestContext, jsonRequest } from "../helpers/test-context";
import { signIn } from "../helpers/sign-in";
import { getContainer } from "@/server/container";

async function giveCoins(userId: string, coins: number): Promise<void> {
  const { repos } = getContainer();
  const user = await repos.users.findById(userId);
  if (!user) throw new Error("user not found");
  await repos.users.update({ ...user, shopCoins: coins, totalCoinsEarned: coins });
}

describe("/api/shop", () => {
  beforeEach(freshTestContext);

  it("GET lists at least one item", async () => {
    await signIn("Ada");
    const res = await LIST_SHOP();
    const body = await res.json();
    expect(body.items.length).toBeGreaterThan(0);
  });

  it("POST /api/shop/buy debits coins and returns the updated user", async () => {
    const me = await signIn("Ada");
    await giveCoins(me.id, 100);
    const res = await BUY(jsonRequest("POST", { itemId: "stone_path" })); // costs 25
    expect(res.status).toBe(200);
    const { user } = await res.json();
    expect(user.shopCoins).toBe(75);
  });

  it("rejects insufficient coins with 402", async () => {
    await signIn("Ada");
    const res = await BUY(jsonRequest("POST", { itemId: "pagoda" })); // costs 420, user has 0
    expect(res.status).toBe(402);
    expect((await res.json()).code).toBe("INSUFFICIENT_COINS");
  });

  it("rejects duplicate purchase with 409", async () => {
    const me = await signIn("Ada");
    await giveCoins(me.id, 100);
    await BUY(jsonRequest("POST", { itemId: "stone_path" }));
    const res = await BUY(jsonRequest("POST", { itemId: "stone_path" }));
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe("DECO_ALREADY_OWNED");
  });
});
