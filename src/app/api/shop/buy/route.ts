import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { userToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { BuyDecoRequestSchema } from "@/shared/schemas/shop";
import type { UserDto } from "@/shared/schemas/user";

export const POST = withErrorMapping(async (req: Request) => {
  const user = await requireUser();
  const body = await parseBody(req, BuyDecoRequestSchema);
  const services = getServices();
  const result = await services.shop.buy(user, body.itemId);
  return NextResponse.json<{ user: UserDto }>({ user: userToDto(result.user) });
});
