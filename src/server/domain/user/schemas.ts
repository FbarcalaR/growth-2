import { z } from "zod";

export const WheelOfLifeSchema = z.object({
  health: z.number().int().min(0),
  career: z.number().int().min(0),
  finances: z.number().int().min(0),
  relationships: z.number().int().min(0),
  personal: z.number().int().min(0),
  fun: z.number().int().min(0),
  spirituality: z.number().int().min(0),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.number(),
  shopCoins: z.number().int().min(0),
  totalCoinsEarned: z.number().int().min(0),
  streak: z.number().int().min(0),
  wheelOfLife: WheelOfLifeSchema,
  prioritiesLocked: z.boolean(),
});
