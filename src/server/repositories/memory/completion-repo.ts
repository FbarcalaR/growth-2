import type { Completion } from "../../domain/completion/types";
import type { CompletionRepo } from "../completion-repo";
import type { UserId } from "../../domain/user/types";

function clone(event: Completion): Completion {
  return { ...event };
}

export function createInMemoryCompletionRepo(): CompletionRepo {
  const byUser = new Map<UserId, Completion[]>();

  return {
    async append(event) {
      const stored = clone(event);
      const list = byUser.get(event.userId) ?? [];
      list.push(stored);
      byUser.set(event.userId, list);
      return clone(stored);
    },

    async listByUserBetween(userId, from, to) {
      const list = byUser.get(userId);
      if (!list) return [];
      return list
        .filter((e) => e.completedDate >= from && e.completedDate <= to)
        .map(clone)
        .sort((a, b) => a.completedAt - b.completedAt);
    },
  };
}
