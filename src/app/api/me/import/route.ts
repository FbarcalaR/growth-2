import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { parseBody } from "@/server/http/validate";
import { userToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { ExportPayloadSchema } from "@/shared/schemas/export";
import type { UserDto } from "@/shared/schemas/user";

export const POST = withErrorMapping(async (req: Request) => {
  const user = await requireUser();
  const payload = await parseBody(req, ExportPayloadSchema);
  const restored = await getServices().users.importState(user, payload);
  return NextResponse.json<UserDto>(userToDto(restored));
});
