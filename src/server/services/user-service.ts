import "server-only";

import { type AppContainer } from "../container";
import { lockPriorities } from "../domain/user/wheel";
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
  };
}
