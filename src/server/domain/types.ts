import type { Area } from "@/shared/areas";
import type { HealthState } from "@/shared/health";
import type { Resource } from "@/shared/resources";

export type UserId = string;
export type GoalId = string;
export type TaskId = string;
export type RoutineId = string;
export type DecoId = string;
export type TrophyId = string;

/** YYYY-MM-DD */
export type ISODate = string;

export type PlantId =
  | "herb"
  | "sunflower"
  | "money_tree"
  | "rose"
  | "mushroom"
  | "crystal"
  | "moon_flower";

/** 0=Seed, 1=Sprout, 2=Seedling, 3=Mature, 4=Blooming. */
export type Stage = 0 | 1 | 2 | 3 | 4;

export type ResourceCost = Partial<Record<Resource, number>>;
export type ResourceDelta = Partial<Record<Resource, number>>;

export type PlantDef = {
  id: PlantId;
  name: string;
  primary: Resource;
  secondary: Resource;
  /** Cumulative resources required to advance from stage N to N+1 (4 entries: 0→1, 1→2, 2→3, 3→4). */
  requirements: [ResourceCost, ResourceCost, ResourceCost, ResourceCost];
};

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

export type WheelOfLife = Record<Area, number>;

export type User = {
  id: UserId;
  name: string;
  createdAt: number;
  shopCoins: number;
  totalCoinsEarned: number;
  streak: number;
  wheelOfLife: WheelOfLife;
  prioritiesLocked: boolean;
};

export type GardenTile =
  | { kind: "plant"; goalId: GoalId }
  | { kind: "deco"; itemId: DecoId }
  | null;

export type GardenState = {
  userId: UserId;
  /** Fixed 8 columns × 6 rows. */
  decoGrid: GardenTile[][];
  owned: DecoId[];
};

export const GARDEN_COLS = 8;
export const GARDEN_ROWS = 6;

export type DecoItem = {
  id: DecoId;
  name: string;
  cost: number;
  emoji: string;
};

export type { Area, HealthState, Resource };
