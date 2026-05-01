/**
 * Lightweight ID generator. Sufficient until Postgres takes over (Epic A) and
 * IDs become DB-allocated UUIDs. Predictable enough that tests can mock it via
 * Vitest if a deterministic value is needed.
 */
export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
