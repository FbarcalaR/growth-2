import { HistoryResponseSchema, type HistoryResponse } from "@/shared/schemas/history";

import { apiFetch } from "./client";

export const historyApi = {
  get: (month: string, signal?: AbortSignal) =>
    apiFetch<HistoryResponse>(
      `/api/history?month=${encodeURIComponent(month)}`,
      HistoryResponseSchema,
      { signal },
    ),
};
