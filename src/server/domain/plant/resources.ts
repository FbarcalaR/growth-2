import type { Resource } from "@/shared/resources";

import type { ResourceCost, ResourceDelta } from "./types";

/**
 * Apply a delta to a goal's plant resources. Each resource is floored at 0 — we
 * never let a plant carry a negative balance even when an action is reversed.
 */
export function applyResourceDelta(current: ResourceCost, delta: ResourceDelta): ResourceCost {
  const next: ResourceCost = { ...current };
  for (const [key, value] of Object.entries(delta)) {
    if (value === undefined) continue;
    const k = key as Resource;
    next[k] = Math.max(0, (next[k] ?? 0) + value);
  }
  return next;
}
