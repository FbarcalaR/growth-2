import { AREA_KEYS } from "@/shared/areas";

import { DomainError } from "./errors";
import type { User, WheelOfLife } from "./types";

export const WHEEL_BUDGET = 30;

export function emptyWheel(): WheelOfLife {
  return AREA_KEYS.reduce<WheelOfLife>((acc, area) => ({ ...acc, [area]: 0 }), {} as WheelOfLife);
}

export function wheelTotal(wheel: WheelOfLife): number {
  return AREA_KEYS.reduce((sum, area) => sum + (wheel[area] ?? 0), 0);
}

/**
 * Lock the user's Wheel-of-Life priorities. Once-and-done — a second call
 * after lock returns 409 at the API layer (this throws the underlying domain
 * error).
 */
export function lockPriorities(user: User, wheel: WheelOfLife): User {
  if (user.prioritiesLocked) throw new DomainError("PRIORITIES_ALREADY_LOCKED");
  if (wheelTotal(wheel) > WHEEL_BUDGET) {
    throw new DomainError("INVALID_INPUT", `Wheel total exceeds budget (${WHEEL_BUDGET})`);
  }
  return { ...user, wheelOfLife: { ...wheel }, prioritiesLocked: true };
}
