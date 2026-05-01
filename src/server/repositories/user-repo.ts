import type { User, UserId } from "../domain/user/types";

export type UserRepo = {
  create(input: { id: UserId; name: string; createdAt: number }): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByName(name: string): Promise<User | null>;
  update(user: User): Promise<User>;
};
