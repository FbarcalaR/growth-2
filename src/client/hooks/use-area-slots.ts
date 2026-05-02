"use client";

import { useMemo } from "react";

import { useGoals, useSession } from "@/client/hooks";
import { AREA_KEYS, type Area } from "@/shared/areas";

export type AreaSlot = {
  /** Quota = priority points for that area in the wheel of life. */
  quota: number;
  /** Active (non-completed) goals already in that area. */
  used: number;
  remaining: number;
  /** True when the user assigned 0 priority points to that area. */
  locked: boolean;
  /** True when used >= quota (user is at the cap). */
  full: boolean;
};

export type AreaSlots = Record<Area, AreaSlot>;

/**
 * Compute per-area "slot" info from the wheel-of-life priorities + the
 * current goals list. Mirrors the prototype's `getAreaSlots(state)` helper:
 * each area's quota is the priority points it received during onboarding,
 * and "used" counts the user's active (non-completed) goals in that area.
 */
export function useAreaSlots(): AreaSlots {
  const { user } = useSession();
  const goals = useGoals();

  return useMemo(() => {
    const wheel = user?.wheelOfLife;
    const list = goals.data ?? [];
    return AREA_KEYS.reduce<AreaSlots>((acc, area) => {
      const quota = Math.max(0, Number(wheel?.[area] ?? 0));
      const used = list.filter((g) => g.area === area && !g.completed).length;
      const remaining = Math.max(0, quota - used);
      acc[area] = {
        quota,
        used,
        remaining,
        locked: quota === 0,
        full: quota > 0 && used >= quota,
      };
      return acc;
    }, {} as AreaSlots);
  }, [user?.wheelOfLife, goals.data]);
}
