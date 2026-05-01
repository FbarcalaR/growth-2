import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { getContainer } from "@/server/container";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { goalToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { UpdateGoalRequestSchema, type GoalDto } from "@/shared/schemas/goal";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorMapping(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const services = getServices();
  const goal = await services.goals.get(user, id);
  return NextResponse.json<GoalDto>(goalToDto(goal, getContainer().clock.now()));
});

export const PATCH = withErrorMapping(async (req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const body = await parseBody(req, UpdateGoalRequestSchema);
  const services = getServices();
  const goal = await services.goals.update(user, id, body);
  return NextResponse.json<GoalDto>(goalToDto(goal, getContainer().clock.now()));
});

export const DELETE = withErrorMapping(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const services = getServices();
  await services.goals.delete(user, id);
  return new NextResponse(null, { status: 204 });
});
