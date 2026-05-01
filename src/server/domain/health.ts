import type { HealthState } from "@/shared/health";

import { toISODate } from "./clock";
import type { Goal, ISODate } from "./types";

const LONG_OVERDUE_DAYS = 7;

/**
 * Count the "overdue weight" of a goal:
 *  - Each incomplete task with a due date in the past contributes 1.
 *  - Tasks more than 7 days overdue count double (the tight slope from the
 *    domain doc).
 *  - Routines whose streak is 0 and which have at least one repeat day this
 *    week add 0.5 — they're slipping but less catastrophically than a
 *    long-overdue task.
 */
export function getOverdueCount(goal: Goal, now: Date): number {
  const today: ISODate = toISODate(now);
  let count = 0;

  for (const task of goal.tasks) {
    if (task.completed) continue;
    if (!task.dueDate) continue;
    if (task.dueDate >= today) continue;

    count += 1;
    const daysLate = daysBetweenISO(today, task.dueDate);
    if (daysLate > LONG_OVERDUE_DAYS) count += 1; // double-weight the long ones
  }

  for (const routine of goal.routines) {
    if (routine.permanentlyCompleted) continue;
    if (routine.streak !== 0) continue;
    if (!routine.repeatDays.some(Boolean)) continue;
    count += 0.5;
  }

  return count;
}

function daysBetweenISO(a: ISODate, b: ISODate): number {
  const aDate = new Date(`${a}T00:00:00`);
  const bDate = new Date(`${b}T00:00:00`);
  return Math.round((aDate.getTime() - bDate.getTime()) / 86_400_000);
}

/** Translate an overdue weight to a 0..100 health score. */
export function getHealth(overdueCount: number): number {
  if (overdueCount <= 0) return 100;
  if (overdueCount < 1.5) return 70;
  if (overdueCount < 2.5) return 40;
  if (overdueCount < 4) return 15;
  return 0;
}

export function getHealthState(health: number): HealthState {
  if (health >= 90) return "healthy";
  if (health >= 60) return "wilting";
  if (health >= 30) return "ill";
  if (health > 0) return "critical";
  return "dead";
}

/** Convenience: combine overdue count → health → state for a goal. */
export function getGoalHealthState(goal: Goal, now: Date): HealthState {
  return getHealthState(getHealth(getOverdueCount(goal, now)));
}
