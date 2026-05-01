import "server-only";

import { systemClock, type Clock } from "./domain/clock";
import { createInMemoryRepositories } from "./repositories/memory";
import type { Repositories } from "./repositories";

/**
 * Composition root. The single place that picks repository implementations and
 * the clock. Services accept these as parameters; nothing else in `src/server/`
 * imports the impls directly.
 *
 * Today: in-memory repositories. Tomorrow (Epic A): Prisma-backed ones, swapped
 * here. No service or domain code needs to change.
 */

let cached: AppContainer | null = null;

export type AppContainer = {
  clock: Clock;
  repos: Repositories;
};

export function getContainer(): AppContainer {
  if (cached) return cached;
  cached = {
    clock: systemClock,
    repos: createInMemoryRepositories(),
  };
  return cached;
}

/** Reset the cached container — used by tests that need a fresh state per case. */
export function resetContainer(): void {
  cached = null;
}
