import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { getContainer } from "@/server/container";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { goalToDto, userToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { UpdateTaskRequestSchema, type GoalDto } from "@/shared/schemas/goal";
import type { UserDto } from "@/shared/schemas/user";

type Ctx = { params: Promise<{ id: string; taskId: string }> };

export const PATCH = withErrorMapping(async (req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id, taskId } = await ctx.params;
  const body = await parseBody(req, UpdateTaskRequestSchema);
  const services = getServices();
  const result = await services.goals.updateTask(user, id, taskId, body);
  const now = getContainer().clock.now();
  return NextResponse.json<{ goal: GoalDto; user: UserDto }>({
    goal: goalToDto(result.goal, now),
    user: userToDto(result.user),
  });
});

export const DELETE = withErrorMapping(async (_req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id, taskId } = await ctx.params;
  const services = getServices();
  const goal = await services.goals.deleteTask(user, id, taskId);
  return NextResponse.json<GoalDto>(goalToDto(goal, getContainer().clock.now()));
});
