"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useCompleteGoal, useDeleteGoal, useUpdateGoal } from "@/client/hooks";
import { BottomSheet, Button } from "@/components/atoms";
import { ConfirmDialog } from "@/components/molecules";
import type { GoalDto, UpdateGoalRequest } from "@/shared/schemas/goal";
import { type Stage } from "@/shared/plants";

import { GoalEditor } from "./goal-editor";
import { GoalIcon } from "./goal-card/goal-icon";
import { DeadPlantBanner, FullyBloomingBanner, GoalGrowthBar } from "./goal-card/goal-growth-bar";
import { GoalStatusChips } from "./goal-card/goal-status-chips";

type GoalDetailSheetProps = {
  open: boolean;
  goal: GoalDto;
  onClose: () => void;
  /** Optional hook for the seed-state "Plant now" CTA (Epic 4). */
  onPlantNow?: (goalId: string) => void;
  /** Slot for the tasks + routines editors. */
  children?: React.ReactNode;
};

/**
 * Drawer that opens when a goal card is tapped on `/garden`. Mirrors the
 * prototype's expanded layout but rendered as a bottom sheet:
 *   • plant or seed icon + bold title + status chips at the top
 *   • "🌱 Plant now in garden" CTA when unplanted
 *   • growth bar / dead / blooming banner depending on state
 *   • children slot (tasks + routines editors)
 *   • optional "🏆 Mark goal as complete" yellow CTA when every item is done
 *   • Edit goal / Delete goal outlined buttons side-by-side at the bottom
 */
export function GoalDetailSheet({
  open,
  goal,
  onClose,
  onPlantNow,
  children,
}: GoalDetailSheetProps) {
  const updateGoal = useUpdateGoal(goal.id);
  const deleteGoal = useDeleteGoal();
  const completeGoal = useCompleteGoal();
  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isSeed = !goal.planted;
  const isDead = goal.healthState === "dead";
  const isFullyGrown = goal.stage >= 4;
  const totalItems = goal.tasks.length + goal.routines.length;
  const doneItems =
    goal.tasks.filter((t) => t.completed).length +
    goal.routines.filter((r) => r.completedToday).length;
  const allDone = totalItems > 0 && doneItems === totalItems;
  const canMarkComplete = !goal.completed && allDone;

  async function handleEditSubmit(input: { title: string; plantType: GoalDto["plantType"] }) {
    const patch: UpdateGoalRequest = { title: input.title, plantType: input.plantType };
    await updateGoal.mutateAsync(patch);
  }

  async function handleDelete() {
    await deleteGoal.mutateAsync(goal.id);
    setConfirmDelete(false);
    onClose();
  }

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title={`${goal.title} details`}
        className="bg-surface-card"
      >
        <div className="overflow-y-auto px-4 pt-2 pb-9">
          <header className="flex items-start gap-2.5">
            <GoalIcon
              area={goal.area}
              plantType={goal.plantType}
              stage={goal.stage as Stage}
              healthState={goal.healthState}
              isSeed={isSeed}
              size={52}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-ink-strong text-[22px] leading-tight font-extrabold">
                {goal.title}
              </h2>
              <div className="mt-1.5">
                <GoalStatusChips goal={goal} doneItems={doneItems} totalItems={totalItems} />
              </div>
            </div>
          </header>

          {isSeed && onPlantNow && (
            <Button
              size="lg"
              onClick={() => onPlantNow(goal.id)}
              className="mt-4 w-full rounded-[14px]"
            >
              🌱 Plant now in garden
            </Button>
          )}

          {!isSeed && isDead && (
            <div className="mt-3">
              <DeadPlantBanner />
            </div>
          )}
          {!isSeed && !isDead && isFullyGrown && (
            <div className="mt-3">
              <FullyBloomingBanner />
            </div>
          )}
          {!isSeed && !isDead && !isFullyGrown && (
            <div className="mt-3">
              <GoalGrowthBar goal={goal} />
            </div>
          )}

          <div className="mt-5 border-t border-[#F0F4EC] pt-4">{children}</div>

          {canMarkComplete && (
            <Button
              variant="warning"
              size="lg"
              onClick={() => completeGoal.mutate(goal.id)}
              disabled={completeGoal.isPending}
              className="mt-4 w-full rounded-[14px]"
            >
              🏆 Mark goal as complete
            </Button>
          )}

          <div className="mt-4 flex items-center gap-2.5 border-t border-[#F0F4EC] pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setEditorOpen(true)}
              leadingIcon={<Pencil size={14} aria-hidden />}
              className="flex-1 rounded-[14px]"
            >
              Edit goal
            </Button>
            <Button
              variant="outline-destructive"
              size="lg"
              onClick={() => setConfirmDelete(true)}
              leadingIcon={<Trash2 size={14} aria-hidden />}
              className="flex-1 rounded-[14px]"
            >
              Delete goal
            </Button>
          </div>
        </div>
      </BottomSheet>

      <GoalEditor
        mode="edit"
        open={editorOpen}
        initial={{ title: goal.title, area: goal.area, plantType: goal.plantType }}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this goal?"
        message={`"${goal.title}" and all its tasks and routines will be removed. This frees the tile if the goal was planted.`}
        confirmLabel="Delete goal"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        busy={deleteGoal.isPending}
      />
    </>
  );
}
