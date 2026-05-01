import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { withErrorMapping } from "@/server/http/error-mapper";
import { getServices } from "@/server/services";
import type { ShopListResponse } from "@/shared/schemas/shop";

export const GET = withErrorMapping(async () => {
  await requireUser();
  const services = getServices();
  const items = await services.shop.list();
  return NextResponse.json<ShopListResponse>({ items });
});
