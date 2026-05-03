import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { userToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import type { UserDto } from "@/shared/schemas/user";

export const POST = withErrorMapping(async () => {
  const user = await requireUser();
  const reset = await getServices().users.resetAll(user);
  return NextResponse.json<UserDto>(userToDto(reset));
});
