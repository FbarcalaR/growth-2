import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { userToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { LockPrioritiesRequestSchema, type UserDto } from "@/shared/schemas/user";

export const PATCH = withErrorMapping(async (req: Request) => {
  const user = await requireUser();
  const body = await parseBody(req, LockPrioritiesRequestSchema);
  const services = getServices();
  const next = await services.users.lockPriorities(user, body.values);
  return NextResponse.json<UserDto>(userToDto(next));
});
