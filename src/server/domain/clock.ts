import type { ISODate } from "./types";

/**
 * Domain clock. Always inject — never read `Date.now()` or `new Date()` inside
 * domain code. Tests pass a frozen clock so "overdue" calculations are
 * deterministic; production passes the system clock.
 */
export type Clock = {
  now(): Date;
};

export const systemClock: Clock = {
  now: () => new Date(),
};

export function frozenClock(iso: string | Date): Clock {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return { now: () => new Date(d.getTime()) };
}

/** Convert a Date to a local-zone YYYY-MM-DD ISO date. */
export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Days between two ISO dates (a − b), positive when a is later. */
export function daysBetween(a: ISODate, b: ISODate): number {
  const aDate = new Date(`${a}T00:00:00`);
  const bDate = new Date(`${b}T00:00:00`);
  const ms = aDate.getTime() - bDate.getTime();
  return Math.round(ms / 86_400_000);
}

export function addDaysISO(iso: ISODate, days: number): ISODate {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}
