import "server-only";

import { PrismaClient } from "@prisma/client";

/**
 * Singleton `PrismaClient`. Re-uses the same instance across hot-module
 * reloads in dev so we don't exhaust connections with every save. In prod
 * each lambda invocation gets its own client; that's fine — Prisma's
 * connection pool reuses TCP connections within the lambda.
 */

declare global {
  var __growthPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__growthPrisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG === "1" ? ["query", "warn", "error"] : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.__growthPrisma = prisma;
