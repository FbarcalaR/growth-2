import { z } from "zod";

import {
  BuyDecoRequestSchema,
  ShopListResponseSchema,
  type BuyDecoRequest,
} from "@/shared/schemas/shop";
import { UserDtoSchema, type UserDto } from "@/shared/schemas/user";

import { apiFetch } from "./client";

const BuyResponseSchema = z.object({ user: UserDtoSchema });

export const shopApi = {
  list: (signal?: AbortSignal) =>
    apiFetch("/api/shop", ShopListResponseSchema, { signal }).then((r) => r.items),

  buy: (input: BuyDecoRequest): Promise<UserDto> =>
    apiFetch("/api/shop/buy", BuyResponseSchema, {
      method: "POST",
      body: BuyDecoRequestSchema.parse(input),
    }).then((r) => r.user),
};
