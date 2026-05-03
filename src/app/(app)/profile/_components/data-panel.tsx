"use client";

import { Database, Download, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { downloadExport, useImportData, useResetData } from "@/client/hooks";
import { Button } from "@/components/atoms";
import { ConfirmDialog } from "@/components/molecules";
import { ExportPayloadSchema } from "@/shared/schemas/export";

/**
 * Story 6.3 — Profile-tab "Data" card. Three actions:
 *
 *   • Export — fetches `/api/me/export` and triggers a JSON download.
 *   • Import — opens a file picker, validates the chosen JSON via
 *     `ExportPayloadSchema`, then POSTs to `/api/me/import`.
 *   • Reset — wipes the user's data via `/api/me/reset`. Gated by a
 *     `<ConfirmDialog>` *and* a follow-up "type RESET to confirm" gate, so
 *     a stray tap can't nuke a real account.
 */
export function DataPanel() {
  const reset = useResetData();
  const importMut = useImportData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [doubleConfirm, setDoubleConfirm] = useState("");
  const [exportBusy, setExportBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExportBusy(true);
    setError(null);
    try {
      await downloadExport();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportBusy(false);
    }
  }

  async function handleImportPick(file: File) {
    setError(null);
    try {
      const text = await file.text();
      const parsed = ExportPayloadSchema.safeParse(JSON.parse(text));
      if (!parsed.success) {
        setError("This file isn't a valid Growth export.");
        return;
      }
      await importMut.mutateAsync(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    }
  }

  async function handleConfirmReset() {
    await reset.mutateAsync();
    setConfirming(false);
    setDoubleConfirm("");
  }

  return (
    <>
      <section
        aria-label="Data"
        className="bg-surface-card border-surface-muted rounded-[18px] border-[1.5px]"
      >
        <header className="flex items-center gap-2 border-b border-[#F0F4EC] px-4 py-3">
          <Database size={14} aria-hidden className="text-brand-muted" />
          <p className="text-brand-muted text-[10px] font-bold tracking-wide uppercase">Data</p>
        </header>

        <div className="flex flex-col gap-2 p-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleExport}
            disabled={exportBusy}
            leadingIcon={<Download size={14} aria-hidden />}
            className="rounded-[12px]"
          >
            {exportBusy ? "Preparing…" : "Export your data"}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            disabled={importMut.isPending}
            leadingIcon={<Upload size={14} aria-hidden />}
            className="rounded-[12px]"
          >
            {importMut.isPending ? "Importing…" : "Import from JSON"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportPick(file);
              // Reset so picking the same file twice in a row still triggers `change`.
              e.target.value = "";
            }}
          />
          <Button
            variant="outline-destructive"
            size="md"
            onClick={() => setConfirming(true)}
            leadingIcon={<RotateCcw size={14} aria-hidden />}
            className="rounded-[12px]"
          >
            Reset all data
          </Button>
          {error && (
            <p className="text-health-critical mt-1 text-[12px] font-semibold" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={confirming}
        title="Reset everything?"
        message="Every goal, plant, decoration, trophy, and history entry will be erased. Your name and login stay. This cannot be undone."
        confirmLabel="I understand — reset"
        confirmDisabled={doubleConfirm.trim().toUpperCase() !== "RESET"}
        onCancel={() => {
          setConfirming(false);
          setDoubleConfirm("");
        }}
        onConfirm={handleConfirmReset}
        busy={reset.isPending}
      >
        <label className="text-brand-muted mt-2 block text-[12px] font-semibold">
          Type <code className="text-ink-strong font-bold">RESET</code> to confirm
          <input
            type="text"
            value={doubleConfirm}
            onChange={(e) => setDoubleConfirm(e.target.value)}
            className="bg-surface-card text-ink-strong border-input-border focus:border-brand-700 mt-1 h-10 w-full rounded-md border px-3 text-sm focus:outline-none"
            autoFocus
          />
        </label>
      </ConfirmDialog>
    </>
  );
}
