"use client";

import { useState } from "react";

import { useUpdateRoutine } from "@/client/hooks";
import { Button, Input } from "@/components/atoms";
import { DayPicker, type RepeatDays } from "@/components/molecules";
import type { RoutineDto } from "@/shared/schemas/goal";

type RoutineEditFormProps = {
  goalId: string;
  routine: RoutineDto;
  onDone: () => void;
};

/** Inline title + repeat-days editor for a single routine. */
export function RoutineEditForm({ goalId, routine, onDone }: RoutineEditFormProps) {
  const updateRoutine = useUpdateRoutine(goalId, routine.id);
  const [title, setTitle] = useState(routine.title);
  const [days, setDays] = useState<RepeatDays>(routine.repeatDays);

  const trimmedTitle = title.trim();
  const hasAnyDay = days.some(Boolean);
  const canSave = !updateRoutine.isPending && trimmedTitle.length > 0 && hasAnyDay;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSave) return;
        await updateRoutine.mutateAsync({
          title: trimmedTitle || routine.title,
          repeatDays: days,
        });
        onDone();
      }}
      className="bg-surface-card border-surface-muted flex flex-col gap-2 rounded-md border p-3"
    >
      <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <DayPicker value={days} onChange={setDays} />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDone}
          disabled={updateRoutine.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!canSave}>
          Save
        </Button>
      </div>
    </form>
  );
}
