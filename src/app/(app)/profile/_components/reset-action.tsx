"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { useResetData } from "@/client/hooks";
import { Button } from "@/components/atoms";
import { ConfirmDialog } from "@/components/molecules";

/**
 * Profile-tab "Reset" action. Wipes the user's data via `/api/me/reset`,
 * gated by a `<ConfirmDialog>` and a follow-up "type RESET to confirm"
 * text gate so a stray tap can't nuke a real account.
 */
export function ResetAction() {
  const reset = useResetData();
  const [confirming, setConfirming] = useState(false);
  const [doubleConfirm, setDoubleConfirm] = useState("");

  async function handleConfirmReset() {
    await reset.mutateAsync();
    setConfirming(false);
    setDoubleConfirm("");
  }

  return (
    <>
      <Button
        variant="outline-destructive"
        size="lg"
        onClick={() => setConfirming(true)}
        leadingIcon={<RotateCcw size={14} aria-hidden />}
        className="w-full rounded-[14px]"
      >
        Reset all data
      </Button>

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
