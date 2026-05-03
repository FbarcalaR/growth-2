"use client";

import { Trash2 } from "lucide-react";

import { useDeleteGoal, useReplantGoal } from "@/client/hooks";
import { Button } from "@/components/atoms";
import { ConfirmDialog } from "@/components/molecules";
import { useState } from "react";

type DeadPlantPanelProps = {
  goalId: string;
  goalTitle: string;
  /** Called after a successful Drop so the parent (drawer) can close. */
  onDeleted?: () => void;
};

/**
 * Replaces the small `<DeadPlantBanner>` when the user opens a dead-plant
 * goal. Two prominent actions:
 *   • Drop goal — `useDeleteGoal`, gated by `<ConfirmDialog>`
 *   • 🌱 Replant — `useReplantGoal` (resets stage to 1, clears resources,
 *     reschedules overdue tasks to today).
 */
export function DeadPlantPanel({ goalId, goalTitle, onDeleted }: DeadPlantPanelProps) {
  const deleteGoal = useDeleteGoal();
  const replantGoal = useReplantGoal();
  const [confirmDrop, setConfirmDrop] = useState(false);
  const [confirmReplant, setConfirmReplant] = useState(false);

  async function handleDrop() {
    await deleteGoal.mutateAsync(goalId);
    setConfirmDrop(false);
    onDeleted?.();
  }

  async function handleReplant() {
    await replantGoal.mutateAsync(goalId);
    setConfirmReplant(false);
  }

  return (
    <>
      <div className="mt-3 rounded-[14px] border border-[#C8C8C8] bg-[#F4F4F4] p-3.5">
        <div className="mb-2.5 flex items-center gap-2.5">
          <span aria-hidden className="text-2xl">
            💀
          </span>
          <div className="flex-1">
            <p className="text-ink-strong text-[13.5px] font-extrabold">Your plant withered</p>
            <p className="mt-0.5 text-[11px] leading-snug text-[#5A5A5A]">
              Too many overdue tasks took their toll. The goal is still here — decide what to do
              next.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline-destructive"
            size="md"
            onClick={() => setConfirmDrop(true)}
            leadingIcon={<Trash2 size={14} aria-hidden />}
            className="flex-1 rounded-[11px]"
          >
            Drop goal
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setConfirmReplant(true)}
            className="flex-1 rounded-[11px]"
          >
            🌱 Replant
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDrop}
        title="Drop this goal?"
        message={`"${goalTitle}" and all its tasks and routines will be removed. This frees the tile.`}
        confirmLabel="Drop goal"
        onCancel={() => setConfirmDrop(false)}
        onConfirm={handleDrop}
        busy={deleteGoal.isPending}
      />

      <ConfirmDialog
        open={confirmReplant}
        title="Replant this goal?"
        message={`"${goalTitle}" restarts as a sprout. Any overdue tasks are rescheduled to today; your task history stays.`}
        confirmLabel="Replant"
        variant="primary"
        onCancel={() => setConfirmReplant(false)}
        onConfirm={handleReplant}
        busy={replantGoal.isPending}
      />
    </>
  );
}
