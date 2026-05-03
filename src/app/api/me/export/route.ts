import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { getServices } from "@/server/services";
import type { ExportPayload } from "@/shared/schemas/export";

export const GET = withErrorMapping(async () => {
  const user = await requireUser();
  const payload = await getServices().users.exportState(user);
  return NextResponse.json<ExportPayload>(payload);
});
