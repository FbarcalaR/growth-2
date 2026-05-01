import type { Area } from "@/shared/areas";

export type UserId = string;

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
