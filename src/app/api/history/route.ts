import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { DomainError } from "@/server/domain/errors";
import { withErrorMapping } from "@/server/http/error-mapper";
import { historyMonthToDto } from "@/server/services/dtos";
import { getServices } from "@/server/services";
import { HistoryQuerySchema, type HistoryResponse } from "@/shared/schemas/history";

export const GET = withErrorMapping(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const parsed = HistoryQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    throw new DomainError("INVALID_INPUT", "Expected month=YYYY-MM");
  }
  const services = getServices();
  const month = await services.history.getMonth(user, parsed.data.month);
  return NextResponse.json<HistoryResponse>(historyMonthToDto(month));
});
