import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { getContainer } from "@/server/container";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { goalToDto, userToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { UpdateRoutineRequestSchema, type GoalDto } from "@/shared/schemas/goal";
import type { UserDto } from "@/shared/schemas/user";

type Ctx = { params: Promise<{ id: string; routineId: string }> };

export const PATCH = withErrorMapping(async (req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id, routineId } = await ctx.params;
  const body = await parseBody(req, UpdateRoutineRequestSchema);
  const services = getServices();
  const result = await services.goals.updateRoutine(user, id, routineId, body);
  const now = getContainer().clock.now();
  return NextResponse.json<{ goal: GoalDto; user: UserDto }>({
    goal: goalToDto(result.goal, now),
    user: userToDto(result.user),
  });
});

export const DELETE = withErrorMapping(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id, routineId } = await ctx.params;
  const services = getServices();
  const goal = await services.goals.deleteRoutine(user, id, routineId);
  return NextResponse.json<GoalDto>(goalToDto(goal, getContainer().clock.now()));
});
