import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { getContainer } from "@/server/container";
import { withErrorMapping } from "@/server/http/error-mapper";
import { todayGroupToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import type { TodayResponse } from "@/shared/schemas/today";

export const GET = withErrorMapping(async () => {
  const user = await requireUser();
  const services = getServices();
  const groups = await services.today.forUser(user);
  const now = getContainer().clock.now();
  return NextResponse.json<TodayResponse>({
    groups: groups.map((g) => todayGroupToDto(g, now)),
  });
});
