import "server-only";

import type { Area } from "@/shared/areas";

import { type AppContainer } from "../container";
import { addDaysISO, toISODate } from "../domain/clock";
import type { Completion } from "../domain/completion/types";
import { DomainError } from "../domain/errors";
import type { Goal, ISODate } from "../domain/goal/types";
import type { User } from "../domain/user/types";

export type HistoryService = ReturnType<typeof createHistoryService>;

export type HistoryItem = {
  kind: "task" | "routine" | "goal";
  itemId: string | null;
  goalId: string;
  goalTitle: string;
  goalArea: Area;
  title: string;
};

export type HistoryDay = {
  date: ISODate;
  completed: HistoryItem[];
  missed: HistoryItem[];
  planned: HistoryItem[];
};

export type HistorySummary = {
  perfectDays: number;
  missedDays: number;
  monthPct: number;
  completedThisMonth: number;
  scheduledThisMonth: number;
  currentStreak: number;
};

export type HistoryMonth = {
  /** "YYYY-MM" — echoed back so the client can validate. */
  month: string;
  days: HistoryDay[];
  summary: HistorySummary;
};

/**
 * History tab data. Reads the append-only `completions` log + the user's
 * current goals, then rolls each day in the queried month into
 * `{ completed, missed, planned }` lists. Past + future days are computed
 * from the goal's *current* tasks/routines (we don't snapshot routines at
 * each toggle); the `Completion` log is the source of truth for "was this
 * actually done on this day".
 */
export function createHistoryService({ clock, repos }: AppContainer) {
  return {
    async getMonth(user: User, monthIso: string): Promise<HistoryMonth> {
      if (!/^\d{4}-\d{2}$/.test(monthIso)) {
        throw new DomainError("INVALID_INPUT", `Invalid month: ${monthIso}`);
      }
      const [yearStr, monthStr] = monthIso.split("-");
      const year = Number(yearStr);
      const monthNum = Number(monthStr); // 1..12
      const firstOfMonth = new Date(year, monthNum - 1, 1);
      const lastOfMonth = new Date(year, monthNum, 0); // day-0 of next month
      const from = toISODate(firstOfMonth);
      const to = toISODate(lastOfMonth);
      const today = toISODate(clock.now());

      const [goals, events] = await Promise.all([
        repos.goals.listByUser(user.id),
        repos.completions.listByUserBetween(user.id, from, to),
      ]);

      const goalsById = new Map<string, Goal>(goals.map((g) => [g.id, g]));
      const eventsByDate = groupBy(events, (e) => e.completedDate);

      const days: HistoryDay[] = [];
      let scheduledThisMonth = 0;
      let completedThisMonth = 0;
      let perfectDays = 0;
      let missedDays = 0;

      for (let iso = from; iso <= to; iso = addDaysISO(iso, 1)) {
        const day = buildDay(iso, today, goalsById, eventsByDate.get(iso) ?? []);
        days.push(day);

        if (iso < today) {
          const scheduled = day.completed.length + day.missed.length;
          const completed = day.completed.length;
          scheduledThisMonth += scheduled;
          completedThisMonth += completed;
          if (scheduled > 0 && completed === scheduled) perfectDays += 1;
          if (scheduled > 0 && completed === 0) missedDays += 1;
        }
      }

      const monthPct = scheduledThisMonth === 0 ? 0 : completedThisMonth / scheduledThisMonth;
      const currentStreak = computeCurrentStreak(today, goalsById, repos.completions, user.id);

      return {
        month: monthIso,
        days,
        summary: {
          perfectDays,
          missedDays,
          monthPct,
          completedThisMonth,
          scheduledThisMonth,
          currentStreak: await currentStreak,
        },
      };
    },
  };
}

function buildDay(
  iso: ISODate,
  today: ISODate,
  goalsById: Map<string, Goal>,
  events: Completion[],
): HistoryDay {
  const isPast = iso < today;
  const isFuture = iso > today;
  const dow = mondayFirstWeekday(iso);

  // Dedupe completion events by (kind, itemId): if the user toggled a task on
  // → off → on within a day, keep only the first event so it counts once.
  const seen = new Set<string>();
  const completed: HistoryItem[] = [];
  for (const event of events) {
    const key = `${event.kind}:${event.itemId ?? event.goalId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const goal = goalsById.get(event.goalId);
    if (!goal) continue; // goal was deleted; skip the orphan event
    completed.push({
      kind: event.kind,
      itemId: event.itemId,
      goalId: event.goalId,
      goalTitle: goal.title,
      goalArea: goal.area,
      title: event.title,
    });
  }

  // What was *scheduled* that day, by walking the user's current goals?
  //
  //   tasks    — `dueDate === iso`
  //   routines — `repeatDays[dow] === true` (current state, since we don't
  //              snapshot routines at toggle time)
  const scheduledTasks: { item: HistoryItem; completed: boolean }[] = [];
  const scheduledRoutines: { item: HistoryItem; completed: boolean }[] = [];

  for (const goal of goalsById.values()) {
    for (const t of goal.tasks) {
      if (t.dueDate !== iso) continue;
      const item: HistoryItem = {
        kind: "task",
        itemId: t.id,
        goalId: goal.id,
        goalTitle: goal.title,
        goalArea: goal.area,
        title: t.title,
      };
      const completedKey = `task:${t.id}`;
      scheduledTasks.push({ item, completed: seen.has(completedKey) });
    }
    for (const r of goal.routines) {
      if (!r.repeatDays[dow]) continue;
      const item: HistoryItem = {
        kind: "routine",
        itemId: r.id,
        goalId: goal.id,
        goalTitle: goal.title,
        goalArea: goal.area,
        title: r.title,
      };
      const completedKey = `routine:${r.id}`;
      scheduledRoutines.push({ item, completed: seen.has(completedKey) });
    }
  }

  if (isFuture) {
    return {
      date: iso,
      completed: [],
      missed: [],
      planned: [...scheduledTasks, ...scheduledRoutines].map((s) => s.item),
    };
  }

  const planned: HistoryItem[] = [];
  const missed: HistoryItem[] = [];

  for (const { item, completed: done } of [...scheduledTasks, ...scheduledRoutines]) {
    if (done) continue; // already in `completed` via the events log
    if (iso === today) planned.push(item);
    else missed.push(item);
  }

  // Past goal-completion events shouldn't pollute "missed" — they're already in
  // `completed`. Goal-completion events have `kind === "goal"` and aren't part
  // of the scheduled walk, so nothing to filter here.
  void isPast;

  return { date: iso, completed, missed, planned };
}

async function computeCurrentStreak(
  today: ISODate,
  goalsById: Map<string, Goal>,
  repo: AppContainer["repos"]["completions"],
  userId: string,
): Promise<number> {
  // Walk back from yesterday day-by-day. A day counts toward the streak when
  // it had >0 scheduled items and every one of them was completed. Stop on
  // the first non-perfect day. Cap at 90 days so a user with no scheduled
  // history doesn't trigger an unbounded scan.
  const MAX = 90;
  let streak = 0;
  let cursor = addDaysISO(today, -1);
  for (let i = 0; i < MAX; i += 1) {
    const dayEvents = await repo.listByUserBetween(userId, cursor, cursor);
    const day = buildDay(cursor, today, goalsById, dayEvents);
    const scheduled = day.completed.length + day.missed.length;
    if (scheduled === 0) break;
    if (day.completed.length !== scheduled) break;
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = out.get(k);
    if (list) list.push(item);
    else out.set(k, [item]);
  }
  return out;
}

/** Convert YYYY-MM-DD to a Mon-first weekday index (Mon=0..Sun=6). */
function mondayFirstWeekday(iso: ISODate): number {
  const d = new Date(`${iso}T00:00:00`);
  return (d.getDay() + 6) % 7;
}
