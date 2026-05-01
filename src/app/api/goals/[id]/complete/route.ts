import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { getContainer } from "@/server/container";
import { withErrorMapping } from "@/server/http/error-mapper";
import { goalToDto, userToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import type { GoalDto } from "@/shared/schemas/goal";
import type { UserDto } from "@/shared/schemas/user";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorMapping(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const services = getServices();
  const result = await services.goals.complete(user, id);
  return NextResponse.json<{ goal: GoalDto; user: UserDto }>({
    goal: goalToDto(result.goal, getContainer().clock.now()),
    user: userToDto(result.user),
  });
});
