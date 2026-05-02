"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteGoal, useUpdateGoal } from "@/client/hooks";
import { BottomSheet, Button } from "@/components/atoms";
import { AreaChip, ConfirmDialog, HealthBadge } from "@/components/molecules";
import type { GoalDto, UpdateGoalRequest } from "@/shared/schemas/goal";
import { type Stage } from "@/shared/plants";

import { GoalEditor } from "./goal-editor";
import { GoalIcon } from "./goal-card/goal-icon";

type GoalDetailSheetProps = {
  open: boolean;
  goal: GoalDto;
  onClose: () => void;
  /** Slot below the header — `<TasksEditor>` and `<RoutinesEditor>` land here. */
  children?: React.ReactNode;
};

/**
 * Bottom-sheet detail view for a single goal. Shows the plant + metadata in
 * the header, exposes Edit (re-uses `<GoalEditor mode="edit" />`) and Delete
 * (gated by `<ConfirmDialog>`), and reserves a slot below the header for
 * task / routine editors.
 */
export function GoalDetailSheet({ open, goal, onClose, children }: GoalDetailSheetProps) {
  const updateGoal = useUpdateGoal(goal.id);
  const deleteGoal = useDeleteGoal();
  const [editorOpen, setEditorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const showHealth = goal.planted && !goal.completed;

  async function handleEditSubmit(input: { title: string; plantType: GoalDto["plantType"] }) {
    const patch: UpdateGoalRequest = { title: input.title, plantType: input.plantType };
    await updateGoal.mutateAsync(patch);
  }

  async function handleDelete() {
    await deleteGoal.mutateAsync(goal.id);
    setConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={`${goal.title} details`}>
        <header className="border-surface-muted flex items-start gap-3 border-b px-5 py-4">
          <GoalIcon
            area={goal.area}
            plantType={goal.plantType}
            stage={goal.stage as Stage}
            healthState={goal.healthState}
            size={56}
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-ink-strong truncate text-lg leading-tight font-extrabold">
              {goal.title}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <AreaChip area={goal.area} />
              {showHealth && <HealthBadge state={goal.healthState} />}
            </div>
          </div>
        </header>

        <div className="overflow-y-auto px-5 py-5">{children}</div>

        <footer className="border-surface-muted flex items-center justify-end gap-2 border-t px-5 py-3">
          <Button
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
            leadingIcon={<Trash2 size={14} aria-hidden />}
          >
            Delete
          </Button>
          <Button
            variant="secondary"
            onClick={() => setEditorOpen(true)}
            leadingIcon={<Pencil size={14} aria-hidden />}
          >
            Edit
          </Button>
        </footer>
      </BottomSheet>

      <GoalEditor
        mode="edit"
        open={editorOpen}
        initial={{ title: goal.title, area: goal.area, plantType: goal.plantType }}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this goal?"
        message={`"${goal.title}" and all its tasks and routines will be removed. This frees the tile if the goal was planted.`}
        confirmLabel="Delete goal"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        busy={deleteGoal.isPending}
      />
    </>
  );
}
