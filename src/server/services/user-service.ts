import "server-only";

import { type AppContainer } from "../container";
import { emptyDecoGrid } from "../domain/garden/operations";
import { emptyWheel, lockPriorities } from "../domain/user/wheel";
import type { User, WheelOfLife } from "../domain/user/types";

import { newId } from "./ids";

export type UserService = ReturnType<typeof createUserService>;

export function createUserService({ clock, repos }: AppContainer) {
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
    async resetAll(user: User): Promise<User> {
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
    },
  };
}
