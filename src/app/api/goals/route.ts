import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { getContainer } from "@/server/container";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { goalToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { CreateGoalRequestSchema, type GoalDto } from "@/shared/schemas/goal";

export const GET = withErrorMapping(async () => {
  const user = await requireUser();
  const services = getServices();
  const goals = await services.goals.list(user);
  const now = getContainer().clock.now();
  const dto: GoalDto[] = goals.map((g) => goalToDto(g, now));
  return NextResponse.json<{ goals: GoalDto[] }>({ goals: dto });
});

export const POST = withErrorMapping(async (req: Request) => {
  const user = await requireUser();
  const body = await parseBody(req, CreateGoalRequestSchema);
  const services = getServices();
  const goal = await services.goals.create(user, body);
  const now = getContainer().clock.now();
  return NextResponse.json<GoalDto>(goalToDto(goal, now), { status: 201 });
});
