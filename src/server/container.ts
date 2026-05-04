import "server-only";

import { systemClock, type Clock } from "./domain/clock";
import { createInMemoryRepositories } from "./repositories/memory";
import type { Repositories } from "./repositories";

/**
 * Composition root. The single place that picks repository implementations and
 * the clock. Services accept these as parameters; nothing else in `src/server/`
 * imports the impls directly.
 *
 * The repo impl is selected by the `GROWTH_REPO` env var:
 *   • `memory` (default) — in-memory store. Wipes on every server restart;
 *     suitable for local dev, tests, and the dev sandbox.
 *   • `prisma` — Postgres via Prisma (Epic A). Picks up `DATABASE_URL` from
 *     the same env. Use in Vercel preview / production.
 *
 * The selection is intentionally explicit (no auto-detection): "I have a
 * DATABASE_URL set" doesn't mean "use it" — many local dev setups want to
 * keep using the in-memory store even with a database around.
 */

let cached: AppContainer | null = null;

export type AppContainer = {
  clock: Clock;
  repos: Repositories;
};

function buildRepos(): Repositories {
  const choice = (process.env.GROWTH_REPO ?? "memory").toLowerCase();
  if (choice === "prisma") {
    // Lazy require keeps `@prisma/client` out of the bundle when the memory
    // impl is selected (e.g. in unit tests, where Prisma isn't generated).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createPrismaRepositories } = require("./repositories/prisma");
    return createPrismaRepositories();
  }
  return createInMemoryRepositories();
}

export function getContainer(): AppContainer {
  if (cached) return cached;
  cached = {
    clock: systemClock,
    repos: buildRepos(),
  };
  return cached;
}

/** Reset the cached container — used by tests that need a fresh state per case. */
export function resetContainer(): void {
  cached = null;
}
