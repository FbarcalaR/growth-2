import { z } from "zod";

export const WheelOfLifeDtoSchema = z.object({
  health: z.number().int().min(0),
  career: z.number().int().min(0),
  finances: z.number().int().min(0),
  relationships: z.number().int().min(0),
  personal: z.number().int().min(0),
  fun: z.number().int().min(0),
  spirituality: z.number().int().min(0),
});

export type WheelOfLifeDto = z.infer<typeof WheelOfLifeDtoSchema>;

export const UserDtoSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.number(),
  shopCoins: z.number().int().min(0),
  totalCoinsEarned: z.number().int().min(0),
  streak: z.number().int().min(0),
  wheelOfLife: WheelOfLifeDtoSchema,
  prioritiesLocked: z.boolean(),
});

export type UserDto = z.infer<typeof UserDtoSchema>;

export const CreateSessionRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
});

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const LockPrioritiesRequestSchema = z.object({
  values: WheelOfLifeDtoSchema,
});

export type LockPrioritiesRequest = z.infer<typeof LockPrioritiesRequestSchema>;
