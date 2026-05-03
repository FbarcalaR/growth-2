import type { ISODate } from "../clock";
import type { GoalId, RoutineId, TaskId } from "../goal/types";
import type { UserId } from "../user/types";

/**
 * A single completion event. Appended whenever the user marks something done
 * (task, routine, or whole goal) so the History tab can render an honest
 * per-day rollup. Never updated — only inserted/queried.
 *
 * `kind` lets the History tab tell tasks/routines/goals apart in the day
 * detail panel; `itemId` is `null` for `kind === "goal"` (the goal itself
 * was completed, no nested item).
 */
export type CompletionKind = "task" | "routine" | "goal";

export type Completion = {
  id: string;
  userId: UserId;
  goalId: GoalId;
  kind: CompletionKind;
  /** TaskId | RoutineId for `task` / `routine`; `null` for `goal`. */
  itemId: TaskId | RoutineId | null;
  /** Snapshot of the title at completion time so deletes don't erase history. */
  title: string;
  /** Local-zone YYYY-MM-DD the event happened on (used for the per-day rollup). */
  completedDate: ISODate;
  /** Unix-ms timestamp for ordering inside a single day. */
  completedAt: number;
};
