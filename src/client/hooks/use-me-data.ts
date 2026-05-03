"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { meApi } from "@/client/api";
import type { ExportPayload } from "@/shared/schemas/export";
import type { UserDto } from "@/shared/schemas/user";

import { queryKeys } from "./query-keys";

/**
 * Mutations for the Profile-tab "Data" panel (Story 6.3): reset, import, and
 * a fetch-and-download helper for export.
 *
 * On reset / import, every cache key the app uses gets invalidated so the rest
 * of the app sees the fresh server state on the next read. Reset also drops
 * the `me` cache to the new (zeroed) record returned by the server.
 */
export function useResetData() {
  const qc = useQueryClient();
  return useMutation<UserDto>({
    mutationFn: () => meApi.reset(),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.me(), user);
      qc.invalidateQueries({ queryKey: queryKeys.goals(), exact: false });
      qc.invalidateQueries({ queryKey: queryKeys.garden(), exact: false });
      qc.invalidateQueries({ queryKey: queryKeys.today() });
      qc.invalidateQueries({ queryKey: ["history"], exact: false });
    },
  });
}

export function useImportData() {
  const qc = useQueryClient();
  return useMutation<UserDto, Error, ExportPayload>({
    mutationFn: (payload) => meApi.importState(payload),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.me(), user);
      qc.invalidateQueries({ queryKey: queryKeys.goals(), exact: false });
      qc.invalidateQueries({ queryKey: queryKeys.garden(), exact: false });
      qc.invalidateQueries({ queryKey: queryKeys.today() });
      qc.invalidateQueries({ queryKey: ["history"], exact: false });
    },
  });
}

/**
 * Trigger a JSON-file download of the user's current state. Lives outside
 * React Query because the response goes straight to the user's disk — there's
 * nothing to cache.
 */
export async function downloadExport(): Promise<void> {
  const payload = await meApi.exportState();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date(payload.exportedAt).toISOString().slice(0, 10);
  a.download = `growth-export-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
