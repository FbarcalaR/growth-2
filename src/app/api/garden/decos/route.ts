import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { gardenToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import {
  PlaceDecoRequestSchema,
  TileCoordsRequestSchema,
  type GardenDto,
} from "@/shared/schemas/garden";

export const POST = withErrorMapping(async (req: Request) => {
  const user = await requireUser();
  const body = await parseBody(req, PlaceDecoRequestSchema);
  const services = getServices();
  const garden = await services.gardens.placeDeco(user, body.itemId, body.col, body.row);
  return NextResponse.json<GardenDto>(gardenToDto(garden), { status: 201 });
});

export const DELETE = withErrorMapping(async (req: Request) => {
  const user = await requireUser();
  const body = await parseBody(req, TileCoordsRequestSchema);
  const services = getServices();
  const garden = await services.gardens.unplaceDeco(user, body.col, body.row);
  return NextResponse.json<GardenDto>(gardenToDto(garden));
});
