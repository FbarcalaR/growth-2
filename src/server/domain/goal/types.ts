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
  completedToday: boolean;
  streak: number;
  /** Mon..Sun. */
  repeatDays: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  permanentlyCompleted?: boolean;
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
