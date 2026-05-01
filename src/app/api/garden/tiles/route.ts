import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { gardenToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { PlantOnTileRequestSchema, type GardenDto } from "@/shared/schemas/garden";

export const POST = withErrorMapping(async (req: Request) => {
  const user = await requireUser();
  const body = await parseBody(req, PlantOnTileRequestSchema);
  const services = getServices();
  const result = await services.gardens.plantOnTile(user, body.goalId, body.col, body.row);
  return NextResponse.json<GardenDto>(gardenToDto(result.garden), { status: 201 });
});
