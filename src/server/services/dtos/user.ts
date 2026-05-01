import type { User } from "../../domain/user/types";
import type { UserDto } from "@/shared/schemas/user";

/** Domain `User` → wire `UserDto`. */
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
