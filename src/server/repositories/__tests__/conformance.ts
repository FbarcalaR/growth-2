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

    it("deleteAllByUser drops every goal owned by the user, leaves others", async () => {
      const { goals } = makeRepos();
      await goals.create(makeGoal("u1", "g1"));
      await goals.create(makeGoal("u1", "g2"));
      await goals.create(makeGoal("u2", "g3"));
      await goals.deleteAllByUser("u1");
      expect(await goals.listByUser("u1")).toEqual([]);
      expect((await goals.listByUser("u2")).map((g) => g.id)).toEqual(["g3"]);
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

  describe("CompletionRepo", () => {
    it("appends events and returns them within a date range", async () => {
      const { completions } = makeRepos();
      await completions.append({
        id: "c1",
        userId: "u1",
        goalId: "g1",
        kind: "task",
        itemId: "t1",
        title: "Read 30m",
        completedDate: "2026-05-03",
        completedAt: 100,
      });
      await completions.append({
        id: "c2",
        userId: "u1",
        goalId: "g1",
        kind: "routine",
        itemId: "r1",
        title: "Stretch",
        completedDate: "2026-05-04",
        completedAt: 200,
      });
      const may = await completions.listByUserBetween("u1", "2026-05-01", "2026-05-31");
      expect(may.map((e) => e.id)).toEqual(["c1", "c2"]);
    });

    it("excludes events outside the range and across users", async () => {
      const { completions } = makeRepos();
      await completions.append({
        id: "c1",
        userId: "u1",
        goalId: "g1",
        kind: "task",
        itemId: "t1",
        title: "Old",
        completedDate: "2026-04-30",
        completedAt: 50,
      });
      await completions.append({
        id: "c2",
        userId: "u2",
        goalId: "g2",
        kind: "task",
        itemId: "t2",
        title: "Other user",
        completedDate: "2026-05-15",
        completedAt: 60,
      });
      const may = await completions.listByUserBetween("u1", "2026-05-01", "2026-05-31");
      expect(may).toEqual([]);
    });

    it("orders events by completedAt", async () => {
      const { completions } = makeRepos();
      await completions.append({
        id: "later",
        userId: "u1",
        goalId: "g1",
        kind: "task",
        itemId: "t1",
        title: "Later",
        completedDate: "2026-05-03",
        completedAt: 200,
      });
      await completions.append({
        id: "earlier",
        userId: "u1",
        goalId: "g1",
        kind: "task",
        itemId: "t2",
        title: "Earlier",
        completedDate: "2026-05-03",
        completedAt: 100,
      });
      const events = await completions.listByUserBetween("u1", "2026-05-01", "2026-05-31");
      expect(events.map((e) => e.id)).toEqual(["earlier", "later"]);
    });

    it("returns clones — caller mutations don't affect the store", async () => {
      const { completions } = makeRepos();
      await completions.append({
        id: "c1",
        userId: "u1",
        goalId: "g1",
        kind: "task",
        itemId: "t1",
        title: "Original",
        completedDate: "2026-05-03",
        completedAt: 100,
      });
      const [first] = await completions.listByUserBetween("u1", "2026-05-01", "2026-05-31");
      first!.title = "Mutated";
      const [reloaded] = await completions.listByUserBetween("u1", "2026-05-01", "2026-05-31");
      expect(reloaded?.title).toBe("Original");
    });

    it("deleteAllByUser drops every event owned by the user, leaves others", async () => {
      const { completions } = makeRepos();
      const base = {
        goalId: "g1",
        kind: "task" as const,
        itemId: "t1",
        title: "x",
        completedDate: "2026-05-03",
        completedAt: 100,
      };
      await completions.append({ id: "c1", userId: "u1", ...base });
      await completions.append({ id: "c2", userId: "u1", ...base });
      await completions.append({ id: "c3", userId: "u2", ...base });
      await completions.deleteAllByUser("u1");
      expect(await completions.listByUserBetween("u1", "2026-05-01", "2026-05-31")).toEqual([]);
      const u2 = await completions.listByUserBetween("u2", "2026-05-01", "2026-05-31");
      expect(u2.map((e) => e.id)).toEqual(["c3"]);
    });
  });
}
