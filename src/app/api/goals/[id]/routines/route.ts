import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { getContainer } from "@/server/container";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { goalToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { CreateRoutineRequestSchema, type GoalDto } from "@/shared/schemas/goal";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorMapping(async (req: Request, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const body = await parseBody(req, CreateRoutineRequestSchema);
  const services = getServices();
  const goal = await services.goals.addRoutine(user, id, body);
  return NextResponse.json<GoalDto>(goalToDto(goal, getContainer().clock.now()), { status: 201 });
});
