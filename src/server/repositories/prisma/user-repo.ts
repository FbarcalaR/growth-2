import "server-only";

import type { User as PrismaUser } from "@prisma/client";

import { emptyWheel } from "../../domain/user/wheel";
import type { User, WheelOfLife } from "../../domain/user/types";
import type { UserRepo } from "../user-repo";

import { prisma } from "./client";

function rowToUser(row: PrismaUser): User {
  return {
    id: row.id,
    name: row.name,
    createdAt: Number(row.createdAt),
    shopCoins: row.shopCoins,
    totalCoinsEarned: row.totalCoinsEarned,
    streak: row.streak,
    // The JSON column starts as `{}` for fresh rows; merge with the empty
    // wheel so callers always get the full Mon..Sun set.
    wheelOfLife: { ...emptyWheel(), ...((row.wheelOfLife ?? {}) as WheelOfLife) },
    prioritiesLocked: row.prioritiesLocked,
  };
}

export function createPrismaUserRepo(): UserRepo {
  return {
    async create({ id, name, createdAt }) {
      const row = await prisma.user.create({
        data: {
          id,
          name,
          createdAt: BigInt(createdAt),
          wheelOfLife: emptyWheel(),
        },
      });
      return rowToUser(row);
    },

    async findById(id) {
      const row = await prisma.user.findUnique({ where: { id } });
      return row ? rowToUser(row) : null;
    },

    async findByName(name) {
      // `name` is no longer @unique (Auth.js makes `email` the identity
      // anchor instead). `findFirst` returns the oldest match — fine for the
      // dev-stub flow, which only matters in non-production.
      const row = await prisma.user.findFirst({ where: { name } });
      return row ? rowToUser(row) : null;
    },

    async update(user) {
      const row = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          createdAt: BigInt(user.createdAt),
          shopCoins: user.shopCoins,
          totalCoinsEarned: user.totalCoinsEarned,
          streak: user.streak,
          wheelOfLife: user.wheelOfLife,
          prioritiesLocked: user.prioritiesLocked,
        },
      });
      return rowToUser(row);
    },
  };
}
