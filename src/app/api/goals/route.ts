import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/server/auth/require-user";
import { getContainer } from "@/server/container";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { goalToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { AREA_KEYS } from "@/shared/areas";
import { CreateGoalRequestSchema, type GoalDto } from "@/shared/schemas/goal";

const GoalListQuerySchema = z.object({
  area: z.enum(AREA_KEYS).optional(),
  status: z.enum(["active", "blooming", "all"]).optional(),
});

export const GET = withErrorMapping(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const parsed = GoalListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  const filters = parsed.success ? parsed.data : {};
  const services = getServices();
  const goals = await services.goals.list(user, filters);
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
