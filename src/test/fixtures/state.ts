import { getContainer, resetContainer } from "@/server/container";
import { gardenToDto, goalToDto, userToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import type { CreateGoalRequest, GoalDto } from "@/shared/schemas/goal";
import type { GardenDto } from "@/shared/schemas/garden";
import type { UserDto, WheelOfLifeDto } from "@/shared/schemas/user";

/**
 * Fixture builders for tests. Drive the **real** in-memory backend through the
 * real services and return DTO-shaped values:
 *
 *  - When domain rules change (rewards, growth, health), fixtures change with
 *    them automatically. No shadow data path to drift.
 *  - The shapes returned are exactly what `/api/*` would return — drop them
 *    straight into a fetch-mock body.
 *
 * Each builder resets the container at the top so a single test can call any
 * one of them and get a clean slate. Re-call to start over.
 */

const DEFAULT_NAME = "Ada";

const DEFAULT_WHEEL: WheelOfLifeDto = {
  health: 5,
  career: 5,
  finances: 5,
  relationships: 5,
  personal: 5,
  fun: 3,
  spirituality: 2,
};

/** A fresh user with no priorities locked and no goals. */
export async function freshUser(name = DEFAULT_NAME): Promise<UserDto> {
  resetContainer();
  const services = getServices();
  const user = await services.users.findOrCreateByName(name);
  return userToDto(user);
}

/** A user whose priorities are locked. Wheel can be overridden. */
export async function lockedUser(
  options: { name?: string; wheel?: WheelOfLifeDto } = {},
): Promise<UserDto> {
  resetContainer();
  const services = getServices();
  const user = await services.users.findOrCreateByName(options.name ?? DEFAULT_NAME);
  const next = await services.users.lockPriorities(user, options.wheel ?? DEFAULT_WHEEL);
  return userToDto(next);
}

export type SeedGoalInput = CreateGoalRequest & {
  /** Optional: tile to plant on. */
  plantOn?: { col: number; row: number };
};

/**
 * A locked user with a list of goals (optionally planted on tiles). Returns
 * the user, goal DTOs, and the garden DTO so tests can mock all three GETs in
 * one go.
 */
export async function seededGoals(inputs: SeedGoalInput[] = defaultGoals()): Promise<{
  user: UserDto;
  goals: GoalDto[];
  garden: GardenDto;
}> {
  resetContainer();
  const services = getServices();
  const user = await services.users.findOrCreateByName(DEFAULT_NAME);
  const locked = await services.users.lockPriorities(user, DEFAULT_WHEEL);

  const { clock, repos } = getContainer();
  const goals: GoalDto[] = [];

  for (const input of inputs) {
    const goal = await services.goals.create(locked, input);
    if (input.plantOn) {
      await services.gardens.plantOnTile(locked, goal.id, input.plantOn.col, input.plantOn.row);
    }
    const refreshed = await repos.goals.findById(locked.id, goal.id);
    if (!refreshed) throw new Error("seededGoals: goal disappeared after creation");
    goals.push(goalToDto(refreshed, clock.now()));
  }

  const finalUser = await repos.users.findById(locked.id);
  if (!finalUser) throw new Error("seededGoals: user disappeared");
  const garden = await repos.gardens.getOrCreate(locked.id);

  return {
    user: userToDto(finalUser),
    goals,
    garden: gardenToDto(garden),
  };
}

function defaultGoals(): SeedGoalInput[] {
  return [
    { title: "Run a 5K race", area: "health", plantOn: { col: 1, row: 4 } },
    { title: "Read 12 books this year", area: "personal" },
    { title: "Save $5,000 for vacation", area: "finances" },
  ];
}
