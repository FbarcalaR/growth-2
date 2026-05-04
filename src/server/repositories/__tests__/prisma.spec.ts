import { afterAll, beforeAll, beforeEach, describe } from "vitest";

import type { PrismaClient } from "@prisma/client";

import { runRepositoryConformance } from "./conformance";
import type { Repositories } from "..";

/**
 * Prisma conformance suite. Runs the same canonical suite the in-memory
 * impl passes, but against a real Postgres database. Gated by
 * `RUN_PRISMA_TESTS=1` + a `DATABASE_URL` so a developer without a local
 * Postgres / Neon branch isn't blocked. Skipped silently in CI today; the
 * shared conformance suite already exercises the in-memory impl on every
 * push.
 *
 * To run locally:
 *   1. Provision a throwaway Postgres (e.g. `docker run -e POSTGRES_PASSWORD=p
 *      -p 5432:5432 postgres`).
 *   2. Export `DATABASE_URL=postgresql://postgres:p@localhost:5432/postgres`
 *      and `RUN_PRISMA_TESTS=1`.
 *   3. `pnpm db:deploy && pnpm test:unit`.
 *
 * Each test truncates all tables in `beforeEach` so cases stay isolated.
 */
const ENABLED = process.env.RUN_PRISMA_TESTS === "1" && Boolean(process.env.DATABASE_URL);

describe.skipIf(!ENABLED)("Prisma repositories", () => {
  // Lazy-load only when the suite actually runs. Keeps `@prisma/client` out
  // of the unit-test runner's import graph when the env flag is off (the
  // generated client doesn't exist in CI without a real DATABASE_URL).
  let factory: () => Repositories;
  let client: PrismaClient;

  async function truncate(): Promise<void> {
    // Order matters: child rows first because Prisma's cascade isn't visible
    // in raw `deleteMany`. Trophies before Goals because Trophy → Goal FK.
    await client.completion.deleteMany();
    await client.gardenTile.deleteMany();
    await client.ownedDeco.deleteMany();
    await client.trophy.deleteMany();
    await client.task.deleteMany();
    await client.routine.deleteMany();
    await client.goal.deleteMany();
    await client.user.deleteMany();
  }

  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const repos = require("../prisma") as { createPrismaRepositories: () => Repositories };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const c = require("../prisma/client") as { prisma: PrismaClient };
    factory = repos.createPrismaRepositories;
    client = c.prisma;
  });

  beforeEach(async () => {
    await truncate();
  });

  afterAll(async () => {
    await truncate();
    await client.$disconnect();
  });

  runRepositoryConformance(() => factory());
});
