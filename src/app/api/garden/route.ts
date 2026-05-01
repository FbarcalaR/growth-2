import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { gardenToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import type { GardenDto } from "@/shared/schemas/garden";

export const GET = withErrorMapping(async () => {
  const user = await requireUser();
  const services = getServices();
  const garden = await services.gardens.get(user);
  return NextResponse.json<GardenDto>(gardenToDto(garden));
});
