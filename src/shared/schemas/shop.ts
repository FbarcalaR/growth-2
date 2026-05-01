import { z } from "zod";

export const DecoItemDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  cost: z.number().int().min(0),
  emoji: z.string(),
});

export type DecoItemDto = z.infer<typeof DecoItemDtoSchema>;

export const ShopListResponseSchema = z.object({
  items: z.array(DecoItemDtoSchema),
});

export type ShopListResponse = z.infer<typeof ShopListResponseSchema>;

export const BuyDecoRequestSchema = z.object({
  itemId: z.string().min(1),
});

export type BuyDecoRequest = z.infer<typeof BuyDecoRequestSchema>;
