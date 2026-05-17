import type { Area } from "@/shared/areas";

import type { ISODate } from "../clock";
import type { PlantId, ResourceCost, ResourceDelta, Stage } from "../plant/types";
import type { UserId } from "../user/types";

export type { ISODate };

export type GoalId = string;
export type TaskId = string;
export type RoutineId = string;
export type TrophyId = string;

export type Task = {
  id: TaskId;
  title: string;
  completed: boolean;
  dueDate: ISODate | null;
};

export type Routine = {
  id: RoutineId;
  title: string;
  /**
   * Day the routine was last marked complete (local-zone YYYY-MM-DD), or
   * `null` if it's never been completed. The wire `completedToday` boolean
   * is derived from this against the current date — that's how "completes
   * for the day" rolls over at midnight without a cron.
   */
  lastCompletedOn: ISODate | null;
  streak: number;
  /** Mon..Sun. */
  repeatDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  permanentlyCompleted?: boolean;
  /** Unix-ms creation timestamp. The History tab uses it to gate the
   *  per-day rollup so a routine only appears on days at or after it
   *  existed (otherwise a routine created today would retroactively make
   *  every past matching weekday look "missed"). Legacy rows default to
   *  `0` (epoch) so existing routines keep behaving as before. */
  createdAt: number;
};

export type Goal = {
  id: GoalId;
  userId: UserId;
  title: string;
  area: Area;
  plantType: PlantId;
  stage: Stage;
  plantRes: ResourceCost;
  planted: boolean;
  tileCol: number | null;
  tileRow: number | null;
  tasks: Task[];
  routines: Routine[];
  completed?: boolean;
  completedAt?: number;
  trophyId?: TrophyId;
};

/** Task/routine completion payout returned by the domain rule functions. */
export type CompletionReward = {
  coins: number;
  resources: ResourceDelta;
};
