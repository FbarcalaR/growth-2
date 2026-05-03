import "server-only";

import { type AppContainer } from "../container";
import { emptyDecoGrid } from "../domain/garden/operations";
import type { GardenState } from "../domain/garden/types";
import type { Goal } from "../domain/goal/types";
import { emptyWheel, lockPriorities } from "../domain/user/wheel";
import type { User, WheelOfLife } from "../domain/user/types";
import type { ExportPayload } from "@/shared/schemas/export";
import { EXPORT_VERSION } from "@/shared/schemas/export";

import { newId } from "./ids";

export type UserService = ReturnType<typeof createUserService>;

export function createUserService({ clock, repos }: AppContainer) {
  /** Internal: wipe everything user-scoped + zero the user's wallet/wheel.
   *  Both the reset endpoint and the importer use this. */
  async function resetEverything(user: User): Promise<User> {
    await Promise.all([
      repos.goals.deleteAllByUser(user.id),
      repos.completions.deleteAllByUser(user.id),
      repos.gardens.update({ userId: user.id, decoGrid: emptyDecoGrid(), owned: [] }),
    ]);
    return repos.users.update({
      ...user,
      shopCoins: 0,
      totalCoinsEarned: 0,
      streak: 0,
      wheelOfLife: emptyWheel(),
      prioritiesLocked: false,
    });
  }

  return {
    /**
     * Find an existing user by name or create a fresh one. Used by the dev
     * sign-in flow so the same name can be re-entered without duplicating
     * accounts.
     */
    async findOrCreateByName(name: string): Promise<User> {
      const existing = await repos.users.findByName(name);
      if (existing) return existing;
      return repos.users.create({ id: newId("user"), name, createdAt: clock.now().getTime() });
    },

    /** Lock the wheel-of-life priorities. Throws PRIORITIES_ALREADY_LOCKED when called twice. */
    async lockPriorities(user: User, wheel: WheelOfLife): Promise<User> {
      const next = lockPriorities(user, wheel);
      return repos.users.update(next);
    },

    /** Rename the signed-in user. Trim + max-length is enforced at the schema layer. */
    async updateName(user: User, name: string): Promise<User> {
      return repos.users.update({ ...user, name });
    },

    /**
     * Wipe everything the user owns (goals, garden, completion log) and zero
     * their wallet/streak/wheel — keeps the user record + name + id so the
     * session stays valid. The next page render shows the priorities-modal
     * again because `prioritiesLocked` is back to `false`.
     */
    resetAll(user: User): Promise<User> {
      return resetEverything(user);
    },

    /**
     * Snapshot of the user's persistent state, suitable for download. Health
     * fields are intentionally omitted — they're recomputed from goals on the
     * next read. IDs are kept so the data is round-trippable for the same
     * account; the importer regenerates IDs anyway.
     */
    async exportState(user: User): Promise<ExportPayload> {
      const [goals, garden] = await Promise.all([
        repos.goals.listByUser(user.id),
        repos.gardens.getOrCreate(user.id),
      ]);
      // Completions don't have a `listAll` accessor — pull a wide window that
      // covers any plausible history. The repo paginates by date, so this is
      // O(events) with no upper-bound query needed for the in-memory impl.
      const completions = await repos.completions.listByUserBetween(
        user.id,
        "0000-01-01",
        "9999-12-31",
      );

      return {
        version: EXPORT_VERSION,
        exportedAt: clock.now().getTime(),
        user: {
          name: user.name,
          shopCoins: user.shopCoins,
          totalCoinsEarned: user.totalCoinsEarned,
          streak: user.streak,
          wheelOfLife: user.wheelOfLife,
          prioritiesLocked: user.prioritiesLocked,
        },
        goals: goals.map((g) => ({
          id: g.id,
          title: g.title,
          area: g.area,
          plantType: g.plantType,
          stage: g.stage,
          plantRes: g.plantRes,
          planted: g.planted,
          tileCol: g.tileCol,
          tileRow: g.tileRow,
          tasks: g.tasks.map((t) => ({ ...t })),
          routines: g.routines.map((r) => ({ ...r, repeatDays: [...r.repeatDays] })),
          completed: g.completed,
          completedAt: g.completedAt,
          trophyId: g.trophyId,
        })),
        garden: { decoGrid: garden.decoGrid, owned: garden.owned },
        completions: completions.map((e) => ({
          id: e.id,
          goalId: e.goalId,
          kind: e.kind,
          itemId: e.itemId,
          title: e.title,
          completedDate: e.completedDate,
          completedAt: e.completedAt,
        })),
      };
    },

    /**
     * Replace the user's state from a previously-exported payload. Resets
     * first (so a partial import never leaves orphaned half-state), then
     * regenerates every goal/task/routine/completion id so a snapshot from
     * one account doesn't collide with another's existing IDs. The imported
     * `name` is ignored — the importer keeps using their current display name.
     */
    async importState(user: User, payload: ExportPayload): Promise<User> {
      // Reset first so the import is "all-or-nothing": if any append fails we
      // end up with a freshly-empty account, not a half-merged one.
      const reset = await resetEverything(user);

      // Update wallet + wheel + priorities-locked from the payload's user block.
      const restored = await repos.users.update({
        ...reset,
        shopCoins: payload.user.shopCoins,
        totalCoinsEarned: payload.user.totalCoinsEarned,
        streak: payload.user.streak,
        wheelOfLife: { ...payload.user.wheelOfLife } as WheelOfLife,
        prioritiesLocked: payload.user.prioritiesLocked,
      });

      // Map old goal-id → new goal-id so completion events keep their links.
      const goalIdMap = new Map<string, string>();
      for (const g of payload.goals) {
        const newGoalId = newId("goal");
        goalIdMap.set(g.id, newGoalId);
        const goal: Goal = {
          id: newGoalId,
          userId: restored.id,
          title: g.title,
          area: g.area,
          plantType: g.plantType,
          stage: g.stage,
          plantRes: { ...g.plantRes },
          planted: g.planted,
          tileCol: g.tileCol,
          tileRow: g.tileRow,
          tasks: g.tasks.map((t) => ({ ...t, id: newId("task") })),
          routines: g.routines.map((r) => ({
            ...r,
            id: newId("routine"),
            repeatDays: [...r.repeatDays] as Goal["routines"][number]["repeatDays"],
          })),
          ...(g.completed !== undefined ? { completed: g.completed } : {}),
          ...(g.completedAt !== undefined ? { completedAt: g.completedAt } : {}),
          ...(g.trophyId !== undefined ? { trophyId: g.trophyId } : {}),
        };
        await repos.goals.create(goal);
      }

      // Replace the garden — but rewrite plant tiles to the new goal ids.
      const remappedGrid: GardenState["decoGrid"] = payload.garden.decoGrid.map((col) =>
        col.map((tile) => {
          if (tile && tile.kind === "plant") {
            const mapped = goalIdMap.get(tile.goalId);
            return mapped ? { kind: "plant", goalId: mapped } : null;
          }
          return tile ?? null;
        }),
      ) as GardenState["decoGrid"];
      await repos.gardens.update({
        userId: restored.id,
        decoGrid: remappedGrid,
        owned: [...payload.garden.owned],
      });

      // Append every event under the new user-id; preserve dates so the
      // history calendar repaints exactly as exported.
      for (const event of payload.completions) {
        await repos.completions.append({
          id: newId("completion"),
          userId: restored.id,
          goalId: goalIdMap.get(event.goalId) ?? event.goalId,
          kind: event.kind,
          itemId: event.itemId,
          title: event.title,
          completedDate: event.completedDate,
          completedAt: event.completedAt,
        });
      }

      return restored;
    },
  };
}
