import { describe, expect, it } from "vitest";

import { emptyDecoGrid } from "../../domain/garden/operations";
import type { Goal } from "../../domain/goal/types";
import type { Repositories } from "..";

/**
 * Interface conformance suite. Any concrete repository implementation
 * (in-memory, Prisma, etc.) must pass this suite — it's the contract behind
 * services and the domain layer.
 *
 * `makeRepos` returns a fresh set of repositories per call so cases don't
 * pollute each other. Memory impls just construct new Maps; Prisma impls will
 * truncate/seed a test database.
 */
export function runRepositoryConformance(makeRepos: () => Repositories): void {
  describe("UserRepo", () => {
    it("creates and retrieves a user", async () => {
      const { users } = makeRepos();
      const user = await users.create({ id: "u1", name: "Ada", createdAt: 0 });
      expect(user.id).toBe("u1");
      expect(user.name).toBe("Ada");
      expect(user.shopCoins).toBe(0);
      expect(user.prioritiesLocked).toBe(false);
      expect(await users.findById("u1")).toEqual(user);
    });

    it("returns null for missing users", async () => {
      const { users } = makeRepos();
      expect(await users.findById("nope")).toBeNull();
      expect(await users.findByName("nope")).toBeNull();
    });

    it("looks up users by name", async () => {
      const { users } = makeRepos();
      await users.create({ id: "u1", name: "Ada", createdAt: 0 });
      const found = await users.findByName("Ada");
      expect(found?.id).toBe("u1");
    });

    it("update writes the new state", async () => {
      const { users } = makeRepos();
      const user = await users.create({ id: "u1", name: "Ada", createdAt: 0 });
      await users.update({ ...user, shopCoins: 42 });
      const reloaded = await users.findById("u1");
      expect(reloaded?.shopCoins).toBe(42);
    });

    it("returns clones — the caller can mutate without affecting the store", async () => {
      const { users } = makeRepos();
      const user = await users.create({ id: "u1", name: "Ada", createdAt: 0 });
      user.shopCoins = 999;
      const reloaded = await users.findById("u1");
      expect(reloaded?.shopCoins).toBe(0);
    });
  });

  describe("GoalRepo", () => {
    function makeGoal(userId: string, id: string, overrides: Partial<Goal> = {}): Goal {
      return {
        id,
        userId,
        title: "test",
        area: "health",
        plantType: "herb",
        stage: 1,
        plantRes: {},
        planted: false,
        tileCol: null,
        tileRow: null,
        tasks: [],
        routines: [],
        ...overrides,
      };
    }

    it("creates and retrieves a goal", async () => {
      const { goals } = makeRepos();
      const goal = await goals.create(makeGoal("u1", "g1"));
      expect(goal.id).toBe("g1");
      expect(await goals.findById("u1", "g1")).toEqual(goal);
    });

    it("findById is user-scoped — a different user can't read someone else's goal", async () => {
      const { goals } = makeRepos();
      await goals.create(makeGoal("u1", "g1"));
      expect(await goals.findById("u2", "g1")).toBeNull();
    });

    it("listByUser returns only the requested user's goals", async () => {
      const { goals } = makeRepos();
      await goals.create(makeGoal("u1", "g1"));
      await goals.create(makeGoal("u1", "g2"));
      await goals.create(makeGoal("u2", "g3"));
      const u1 = await goals.listByUser("u1");
      expect(u1.map((g) => g.id).sort()).toEqual(["g1", "g2"]);
    });

    it("update writes the new state", async () => {
      const { goals } = makeRepos();
      const goal = await goals.create(makeGoal("u1", "g1"));
      await goals.update({ ...goal, title: "renamed" });
      const reloaded = await goals.findById("u1", "g1");
      expect(reloaded?.title).toBe("renamed");
    });

    it("update throws for a goal that doesn't exist", async () => {
      const { goals } = makeRepos();
      await expect(goals.update(makeGoal("u1", "ghost"))).rejects.toThrow();
    });

    it("delete removes the goal and prevents subsequent deletes", async () => {
      const { goals } = makeRepos();
      await goals.create(makeGoal("u1", "g1"));
      await goals.delete("u1", "g1");
      expect(await goals.findById("u1", "g1")).toBeNull();
      await expect(goals.delete("u1", "g1")).rejects.toThrow();
    });

    it("returns clones — the caller can mutate without affecting the store", async () => {
      const { goals } = makeRepos();
      const goal = await goals.create(makeGoal("u1", "g1"));
      goal.title = "MUTATED";
      const reloaded = await goals.findById("u1", "g1");
      expect(reloaded?.title).toBe("test");
    });
  });

  describe("GardenRepo", () => {
    it("creates an empty 8×6 garden on first read", async () => {
      const { gardens } = makeRepos();
      const garden = await gardens.getOrCreate("u1");
      expect(garden.userId).toBe("u1");
      expect(garden.decoGrid).toHaveLength(8);
      expect(garden.decoGrid[0]).toHaveLength(6);
      expect(garden.owned).toEqual([]);
    });

    it("returns the same garden on subsequent reads", async () => {
      const { gardens } = makeRepos();
      const a = await gardens.getOrCreate("u1");
      await gardens.update({ ...a, owned: ["fountain"] });
      const b = await gardens.getOrCreate("u1");
      expect(b.owned).toEqual(["fountain"]);
    });

    it("isolates gardens by userId", async () => {
      const { gardens } = makeRepos();
      const a = await gardens.getOrCreate("u1");
      await gardens.update({ ...a, owned: ["fountain"] });
      const b = await gardens.getOrCreate("u2");
      expect(b.owned).toEqual([]);
    });

    it("returns clones — the caller can mutate without affecting the store", async () => {
      const { gardens } = makeRepos();
      const garden = await gardens.getOrCreate("u1");
      garden.owned.push("fountain");
      garden.decoGrid = emptyDecoGrid();
      const reloaded = await gardens.getOrCreate("u1");
      expect(reloaded.owned).toEqual([]);
    });
  });

  describe("ShopRepo", () => {
    it("returns at least one item, each with id/name/cost/emoji", async () => {
      const { shop } = makeRepos();
      const items = await shop.list();
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(typeof item.id).toBe("string");
        expect(typeof item.name).toBe("string");
        expect(typeof item.cost).toBe("number");
        expect(item.cost).toBeGreaterThanOrEqual(0);
        expect(typeof item.emoji).toBe("string");
      }
    });
  });
}
