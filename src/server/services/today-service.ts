import "server-only";

import { type AppContainer } from "../container";
import { toISODate } from "../domain/clock";
import type { Goal, ISODate, Routine, Task } from "../domain/goal/types";
import type { User } from "../domain/user/types";

export type TodayService = ReturnType<typeof createTodayService>;

export type TodayGroup = {
  goal: Goal;
  /** Tasks visible today: due today, overdue, undated, or already completed today. */
  tasks: Task[];
  /** Routines visible today: scheduled for today's weekday, or already completed today. */
  routines: Routine[];
};

/**
 * Compute the "Today" view for a user. Filtering rules mirror the prototype:
 *
 *   tasks    — included if `dueDate <= todayIso` OR `dueDate === null` OR `completed`
 *              (covers due today, overdue, undated, and already-completed work)
 *   routines — included if scheduled for today's weekday OR `completedToday`
 *
 * The goal is excluded entirely if neither array has anything visible. Goals
 * that are completed (the goal itself, not the items) are skipped.
 *
 * Returns goals in the same order the user persisted them. Sorting / pinning is
 * a client concern.
 */
export function createTodayService({ clock, repos }: AppContainer) {
  return {
    async forUser(user: User): Promise<TodayGroup[]> {
      const now = clock.now();
      const today: ISODate = toISODate(now);
      const dowMonFirst = mondayFirstWeekday(now);

      const goals = await repos.goals.listByUser(user.id);
      const groups: TodayGroup[] = [];

      for (const goal of goals) {
        if (goal.completed) continue;

        const tasks = goal.tasks.filter((t) => isTaskVisibleToday(t, today));
        const routines = goal.routines.filter((r) => isRoutineVisibleToday(r, today, dowMonFirst));

        if (tasks.length === 0 && routines.length === 0) continue;
        groups.push({ goal, tasks, routines });
      }

      return groups;
    },
  };
}

function isTaskVisibleToday(task: Task, today: ISODate): boolean {
  if (task.completed) return true; // show completed-today work in the "Done" section
  if (!task.dueDate) return true; // undated tasks are always visible
  return task.dueDate <= today; // due today or overdue
}

function isRoutineVisibleToday(routine: Routine, today: ISODate, dowMonFirst: number): boolean {
  if (routine.permanentlyCompleted) return false;
  if (routine.lastCompletedOn === today) return true;
  return Boolean(routine.repeatDays[dowMonFirst]);
}

/** Convert JS day-of-week (Sun=0..Sat=6) to a Mon-first index (Mon=0..Sun=6). */
function mondayFirstWeekday(now: Date): number {
  const jsDay = now.getDay();
  return (jsDay + 6) % 7;
}
