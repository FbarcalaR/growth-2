import type { GardenState, Goal, User, UserId } from "../domain/types";

/**
 * Persistence interfaces. Every method is `userId`-scoped (the system is
 * multi-user from day 1, even though v1 UX is single-user). The same
 * conformance test suite runs against any implementation that fulfils these
 * interfaces — see `__tests__/conformance.ts`.
 */

export type UserRepo = {
  create(input: { id: UserId; name: string; createdAt: number }): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByName(name: string): Promise<User | null>;
  update(user: User): Promise<User>;
};

export type GoalRepo = {
  create(goal: Goal): Promise<Goal>;
  findById(userId: UserId, goalId: string): Promise<Goal | null>;
  listByUser(userId: UserId): Promise<Goal[]>;
  update(goal: Goal): Promise<Goal>;
  delete(userId: UserId, goalId: string): Promise<void>;
};

export type GardenRepo = {
  /**
   * Returns the user's garden, creating an empty one on the first read so
   * services don't need to special-case "no garden yet".
   */
  getOrCreate(userId: UserId): Promise<GardenState>;
  update(garden: GardenState): Promise<GardenState>;
};

export type ShopRepo = {
  /** The shop catalog is global (not per-user); listed here so the boundary stays uniform. */
  list(): Promise<Array<{ id: string; name: string; cost: number; emoji: string }>>;
};

export type Repositories = {
  users: UserRepo;
  goals: GoalRepo;
  gardens: GardenRepo;
  shop: ShopRepo;
};
