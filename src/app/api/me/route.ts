import { NextResponse } from "next/server";

import { clearDevSession, setDevSessionUserId } from "@/server/auth/dev-session";
import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { userToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { CreateSessionRequestSchema, type UserDto } from "@/shared/schemas/user";

export const GET = withErrorMapping(async () => {
  const user = await requireUser();
  return NextResponse.json<UserDto>(userToDto(user));
});

export const POST = withErrorMapping(async (req: Request) => {
  const body = await parseBody(req, CreateSessionRequestSchema);
  const services = getServices();
  const user = await services.users.findOrCreateByName(body.name);
  await setDevSessionUserId(user.id);
  return NextResponse.json<UserDto>(userToDto(user), { status: 201 });
});

export const DELETE = withErrorMapping(async () => {
  await clearDevSession();
  return new NextResponse(null, { status: 204 });
});
