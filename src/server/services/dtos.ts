import { getGoalHealthState, getHealth, getOverdueCount } from "../domain/health";
import type { GardenState } from "../domain/garden/types";
import type { Goal } from "../domain/goal/types";
import type { User } from "../domain/user/types";
import type { GardenDto } from "@/shared/schemas/garden";
import type { GoalDto } from "@/shared/schemas/goal";
import type { UserDto } from "@/shared/schemas/user";

/**
 * Map domain entities to wire DTOs. The Goal DTO drops `userId` (the wire
 * doesn't need it — the API is already user-scoped) and adds derived fields
 * (`health`, `healthState`).
 */

export function userToDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
    shopCoins: user.shopCoins,
    totalCoinsEarned: user.totalCoinsEarned,
    streak: user.streak,
    wheelOfLife: { ...user.wheelOfLife },
    prioritiesLocked: user.prioritiesLocked,
  };
}

export function goalToDto(goal: Goal, now: Date): GoalDto {
  const overdue = getOverdueCount(goal, now);
  return {
    id: goal.id,
    title: goal.title,
    area: goal.area,
    plantType: goal.plantType,
    stage: goal.stage,
    plantRes: { ...goal.plantRes },
    planted: goal.planted,
    tileCol: goal.tileCol,
    tileRow: goal.tileRow,
    tasks: goal.tasks.map((t) => ({ ...t })),
    routines: goal.routines.map((r) => ({
      ...r,
      repeatDays: [...r.repeatDays] as GoalDto["routines"][number]["repeatDays"],
    })),
    completed: goal.completed,
    completedAt: goal.completedAt,
    trophyId: goal.trophyId,
    health: getHealth(overdue),
    healthState: getGoalHealthState(goal, now),
  };
}

export function gardenToDto(garden: GardenState): GardenDto {
  return {
    decoGrid: garden.decoGrid.map((c) => [...c]) as GardenDto["decoGrid"],
    owned: [...garden.owned],
  };
}
