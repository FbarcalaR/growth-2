"use client";

import { Award, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useCompleteRoutinePermanent, useDeleteRoutine, useUpdateRoutine } from "@/client/hooks";
import { ConfirmDialog, RoutineRow, SwipeableRow, type SwipeAction } from "@/components/molecules";
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
 * One routine in the list.  Three modes:
 *   - graduated → read-only `<GraduatedRoutineRow>` (no swipe)
 *   - editing  → inline form
 *   - default  → `<SwipeableRow>` whose body is `<RoutineRow>`. Swipe-left
 *                reveals Done (graduate) / Edit / Delete; tapping the body
 *                toggles `completedToday`.
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

  const actions: SwipeAction[] = [
    {
      label: "Done",
      icon: <Award size={16} aria-hidden />,
      color: "#3A6647",
      onClick: () => setConfirmGraduate(true),
    },
    {
      label: "Edit",
      icon: <Pencil size={16} aria-hidden />,
      color: "#7A8A7A",
      onClick: () => setEditing(true),
    },
    {
      label: "Delete",
      icon: <Trash2 size={16} aria-hidden />,
      color: "#C9484E",
      onClick: () => deleteRoutine.mutate(routine.id),
    },
  ];

  return (
    <>
      <SwipeableRow
        actions={actions}
        onPress={() => updateRoutine.mutate({ completedToday: !routine.completedToday })}
      >
        <RoutineRow
          title={routine.title}
          completedToday={routine.completedToday}
          streak={routine.streak}
          area={area}
          // Swipeable wrapper owns the toggle on press.
          onToggle={() => undefined}
          className="rounded-md border-0"
        />
      </SwipeableRow>
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
