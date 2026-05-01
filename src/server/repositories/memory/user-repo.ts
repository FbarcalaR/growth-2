import type { User, UserId, WheelOfLife } from "../../domain/user/types";
import { emptyWheel } from "../../domain/user/wheel";
import type { UserRepo } from "../user-repo";

function clone(user: User): User {
  return { ...user, wheelOfLife: { ...user.wheelOfLife } as WheelOfLife };
}

export function createInMemoryUserRepo(): UserRepo {
  const byId = new Map<UserId, User>();

  return {
    async create({ id, name, createdAt }) {
      const user: User = {
        id,
        name,
        createdAt,
        shopCoins: 0,
        totalCoinsEarned: 0,
        streak: 0,
        wheelOfLife: emptyWheel(),
        prioritiesLocked: false,
      };
      byId.set(id, user);
      return clone(user);
    },

    async findById(id) {
      const user = byId.get(id);
      return user ? clone(user) : null;
    },

    async findByName(name) {
      for (const user of byId.values()) {
        if (user.name === name) return clone(user);
      }
      return null;
    },

    async update(user) {
      const next = clone(user);
      byId.set(user.id, next);
      return clone(next);
    },
  };
}
