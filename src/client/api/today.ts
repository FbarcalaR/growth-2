import { TodayResponseSchema, type TodayResponse } from "@/shared/schemas/today";

import { apiFetch } from "./client";

export const todayApi = {
  get: (signal?: AbortSignal) =>
    apiFetch<TodayResponse>("/api/today", TodayResponseSchema, { signal }),
};
