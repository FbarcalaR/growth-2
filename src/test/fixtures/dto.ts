import type { GoalDto, RoutineDto, TaskDto } from "@/shared/schemas/goal";
import type { TodayGroupDto } from "@/shared/schemas/today";

/**
 * Plain DTO builders. **Do not** touch the in-memory backend — they're for
 * client-side specs that mock `fetch` and just need a well-shaped object to
 * hand back. Pair with `setupFetchMock()` to stand in for the server.
 *
 * Pass a partial to override fields:
 * `makeGoalDto({ title: "Run a 5K", planted: true, stage: 2 })`.
 */
export function makeGoalDto(overrides: Partial<GoalDto> = {}): GoalDto {
  return {
    id: "g1",
    title: "Run a 5K",
    area: "health",
    plantType: "herb",
    stage: 0,
    plantRes: {},
    planted: false,
    tileCol: null,
    tileRow: null,
    tasks: [],
    routines: [],
    health: 100,
    healthState: "healthy",
    ...overrides,
  };
}

export function makeTaskDto(overrides: Partial<TaskDto> = {}): TaskDto {
  return { id: "t1", title: "Buy shoes", completed: false, dueDate: null, ...overrides };
}

export function makeRoutineDto(overrides: Partial<RoutineDto> = {}): RoutineDto {
  return {
    id: "r1",
    title: "Read 30 minutes",
    completedToday: false,
    streak: 0,
    repeatDays: [true, true, true, true, true, true, true],
    ...overrides,
  };
}

/**
 * Build a Today-list group from a goal + (optional) tasks/routines. Mirrors
 * what the `/api/today` endpoint emits, useful when a page test wants to
 * skip the round-trip through `seededGoals` and just hand the page a
 * canned response.
 */
export function makeTodayGroup(
  goal: GoalDto,
  items: { tasks?: TaskDto[]; routines?: RoutineDto[] } = {},
): TodayGroupDto {
  return {
    goalId: goal.id,
    goalTitle: goal.title,
    goalArea: goal.area,
    goalPlantType: goal.plantType,
    goalStage: goal.stage,
    goalHealth: goal.health,
    goalHealthState: goal.healthState,
    tasks: items.tasks ?? goal.tasks,
    routines: items.routines ?? goal.routines,
  };
}
