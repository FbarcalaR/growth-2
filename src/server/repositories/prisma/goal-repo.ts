import "server-only";

import type {
  Goal as PrismaGoal,
  Routine as PrismaRoutine,
  Task as PrismaTask,
} from "@prisma/client";

import type { Area } from "@/shared/areas";

import { DomainError } from "../../domain/errors";
import type { Goal, Routine, Task } from "../../domain/goal/types";
import type { PlantId, ResourceCost, Stage } from "../../domain/plant/types";
import type { GoalRepo } from "../goal-repo";

import { prisma } from "./client";

type GoalWithChildren = PrismaGoal & { tasks: PrismaTask[]; routines: PrismaRoutine[] };

function rowToTask(row: PrismaTask): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    dueDate: row.dueDate,
  };
}

function rowToRoutine(row: PrismaRoutine): Routine {
  return {
    id: row.id,
    title: row.title,
    completedToday: row.completedToday,
    streak: row.streak,
    repeatDays: row.repeatDays as Routine["repeatDays"],
    ...(row.permanentlyCompleted ? { permanentlyCompleted: true } : {}),
  };
}

function rowToGoal(row: GoalWithChildren): Goal {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    area: row.area as Area,
    plantType: row.plantType as PlantId,
    stage: row.stage as Stage,
    plantRes: (row.plantRes ?? {}) as ResourceCost,
    planted: row.planted,
    tileCol: row.tileCol,
    tileRow: row.tileRow,
    tasks: row.tasks.sort((a, b) => a.position - b.position).map(rowToTask),
    routines: row.routines.sort((a, b) => a.position - b.position).map(rowToRoutine),
    ...(row.completed ? { completed: row.completed } : {}),
    ...(row.completedAt !== null ? { completedAt: Number(row.completedAt) } : {}),
    ...(row.trophyId ? { trophyId: row.trophyId } : {}),
  };
}

export function createPrismaGoalRepo(): GoalRepo {
  return {
    async create(goal) {
      const row = await prisma.goal.create({
        data: {
          id: goal.id,
          userId: goal.userId,
          title: goal.title,
          area: goal.area,
          plantType: goal.plantType,
          stage: goal.stage,
          plantRes: goal.plantRes,
          planted: goal.planted,
          tileCol: goal.tileCol,
          tileRow: goal.tileRow,
          completed: goal.completed ?? false,
          completedAt: goal.completedAt !== undefined ? BigInt(goal.completedAt) : null,
          trophyId: goal.trophyId ?? null,
          tasks: { create: goal.tasks.map((t, i) => ({ ...t, position: i })) },
          routines: {
            create: goal.routines.map((r, i) => ({
              id: r.id,
              title: r.title,
              completedToday: r.completedToday,
              streak: r.streak,
              repeatDays: r.repeatDays,
              permanentlyCompleted: r.permanentlyCompleted ?? false,
              position: i,
            })),
          },
        },
        include: { tasks: true, routines: true },
      });
      return rowToGoal(row);
    },

    async findById(userId, goalId) {
      const row = await prisma.goal.findFirst({
        where: { id: goalId, userId },
        include: { tasks: true, routines: true },
      });
      return row ? rowToGoal(row) : null;
    },

    async listByUser(userId) {
      const rows = await prisma.goal.findMany({
        where: { userId },
        include: { tasks: true, routines: true },
        orderBy: { id: "asc" },
      });
      return rows.map(rowToGoal);
    },

    async update(goal) {
      // Prisma doesn't have first-class "replace this set of children" — we
      // diff manually so position-changes / deletions don't blow up.
      const existing = await prisma.goal.findFirst({
        where: { id: goal.id, userId: goal.userId },
        include: { tasks: true, routines: true },
      });
      if (!existing) throw new DomainError("GOAL_NOT_FOUND");

      const updatedRow = await prisma.$transaction(async (tx) => {
        await tx.goal.update({
          where: { id: goal.id },
          data: {
            title: goal.title,
            area: goal.area,
            plantType: goal.plantType,
            stage: goal.stage,
            plantRes: goal.plantRes,
            planted: goal.planted,
            tileCol: goal.tileCol,
            tileRow: goal.tileRow,
            completed: goal.completed ?? false,
            completedAt: goal.completedAt !== undefined ? BigInt(goal.completedAt) : null,
            trophyId: goal.trophyId ?? null,
          },
        });

        // Tasks: drop everything, re-insert with positions. Cheap because the
        // count is small (≤ ~20 per goal in practice). Avoids the hand-rolled
        // diff that's easy to get wrong with reordering.
        await tx.task.deleteMany({ where: { goalId: goal.id } });
        if (goal.tasks.length > 0) {
          await tx.task.createMany({
            data: goal.tasks.map((t, i) => ({
              id: t.id,
              goalId: goal.id,
              title: t.title,
              completed: t.completed,
              dueDate: t.dueDate,
              position: i,
            })),
          });
        }

        await tx.routine.deleteMany({ where: { goalId: goal.id } });
        if (goal.routines.length > 0) {
          await tx.routine.createMany({
            data: goal.routines.map((r, i) => ({
              id: r.id,
              goalId: goal.id,
              title: r.title,
              completedToday: r.completedToday,
              streak: r.streak,
              repeatDays: r.repeatDays,
              permanentlyCompleted: r.permanentlyCompleted ?? false,
              position: i,
            })),
          });
        }

        return tx.goal.findUniqueOrThrow({
          where: { id: goal.id },
          include: { tasks: true, routines: true },
        });
      });
      return rowToGoal(updatedRow);
    },

    async delete(userId, goalId) {
      const result = await prisma.goal.deleteMany({ where: { id: goalId, userId } });
      if (result.count === 0) throw new DomainError("GOAL_NOT_FOUND");
    },

    async deleteAllByUser(userId) {
      await prisma.goal.deleteMany({ where: { userId } });
    },
  };
}
