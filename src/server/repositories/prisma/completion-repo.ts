import "server-only";

import type { Completion as PrismaCompletion } from "@prisma/client";

import type { Completion, CompletionKind } from "../../domain/completion/types";
import type { CompletionRepo } from "../completion-repo";

import { prisma } from "./client";

function rowToCompletion(row: PrismaCompletion): Completion {
  return {
    id: row.id,
    userId: row.userId,
    goalId: row.goalId,
    kind: row.kind as CompletionKind,
    itemId: row.itemId,
    title: row.title,
    completedDate: row.completedDate,
    completedAt: Number(row.completedAt),
  };
}

export function createPrismaCompletionRepo(): CompletionRepo {
  return {
    async append(event) {
      const row = await prisma.completion.create({
        data: {
          id: event.id,
          userId: event.userId,
          goalId: event.goalId,
          kind: event.kind,
          itemId: event.itemId,
          title: event.title,
          completedDate: event.completedDate,
          completedAt: BigInt(event.completedAt),
        },
      });
      return rowToCompletion(row);
    },

    async listByUserBetween(userId, from, to) {
      const rows = await prisma.completion.findMany({
        where: {
          userId,
          completedDate: { gte: from, lte: to },
        },
        orderBy: { completedAt: "asc" },
      });
      return rows.map(rowToCompletion);
    },

    async deleteAllByUser(userId) {
      await prisma.completion.deleteMany({ where: { userId } });
    },
  };
}
