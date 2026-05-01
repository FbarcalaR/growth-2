import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { getContainer } from "@/server/container";
import { withErrorMapping } from "@/server/http/error-mapper";
import { goalToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import type { GoalDto } from "@/shared/schemas/goal";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorMapping(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const services = getServices();
  const goal = await services.goals.replant(user, id);
  return NextResponse.json<GoalDto>(goalToDto(goal, getContainer().clock.now()));
});
