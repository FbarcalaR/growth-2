"use client";

import { Award, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useCompleteRoutinePermanent, useDeleteRoutine, useUpdateRoutine } from "@/client/hooks";
import { ConfirmDialog, RoutineRow } from "@/components/molecules";
import type { Area } from "@/shared/areas";
import type { RoutineDto } from "@/shared/schemas/goal";

import { GraduatedRoutineRow } from "./graduated-routine-row";
import { RoutineEditForm } from "./routine-edit-form";

type RoutineRowItemProps = {
  goalId: string;
  area: Area;
  routine: RoutineDto;
};

/**
 * A single routine row. Switches between three modes:
 *   - graduated (permanently complete) → read-only with a kept-streak label
 *   - editing → inline title + day-picker form
 *   - default → checkbox toggle + graduate / edit / delete affordances
 */
export function RoutineRowItem({ goalId, area, routine }: RoutineRowItemProps) {
  const updateRoutine = useUpdateRoutine(goalId, routine.id);
  const deleteRoutine = useDeleteRoutine(goalId);
  const completePermanent = useCompleteRoutinePermanent(goalId);
  const [editing, setEditing] = useState(false);
  const [confirmGraduate, setConfirmGraduate] = useState(false);

  if (routine.permanentlyCompleted) {
    return <GraduatedRoutineRow goalId={goalId} routine={routine} />;
  }

  if (editing) {
    return <RoutineEditForm goalId={goalId} routine={routine} onDone={() => setEditing(false)} />;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <RoutineRow
            title={routine.title}
            completedToday={routine.completedToday}
            streak={routine.streak}
            area={area}
            onToggle={(next) => updateRoutine.mutate({ completedToday: next })}
          />
        </div>
        <button
          type="button"
          aria-label={`Mark "${routine.title}" permanently complete`}
          onClick={() => setConfirmGraduate(true)}
          className="text-brand-muted hover:text-area-fun rounded-md p-1.5"
        >
          <Award size={14} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Edit "${routine.title}"`}
          onClick={() => setEditing(true)}
          className="text-brand-muted hover:text-brand-700 rounded-md p-1.5"
        >
          <Pencil size={14} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Delete "${routine.title}"`}
          onClick={() => deleteRoutine.mutate(routine.id)}
          className="text-brand-muted hover:text-health-critical rounded-md p-1.5"
        >
          <Trash2 size={14} aria-hidden />
        </button>
      </div>
      <ConfirmDialog
        open={confirmGraduate}
        title="Graduate this routine?"
        message={`"${routine.title}" will move out of your daily list and the ${routine.streak}-day streak is preserved as a milestone.`}
        confirmLabel="Graduate"
        variant="primary"
        onCancel={() => setConfirmGraduate(false)}
        onConfirm={async () => {
          await completePermanent.mutateAsync(routine.id);
          setConfirmGraduate(false);
        }}
        busy={completePermanent.isPending}
      />
    </>
  );
}
