"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { useAddRoutine } from "@/client/hooks";
import { Button, Input } from "@/components/atoms";
import { ALL_DAYS, DayPicker, type RepeatDays } from "@/components/molecules";

type AddRoutineRowProps = {
  goalId: string;
};

/** Toggleable "Add routine" button + inline form. */
export function AddRoutineRow({ goalId }: AddRoutineRowProps) {
  const addRoutine = useAddRoutine(goalId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [days, setDays] = useState<RepeatDays>(ALL_DAYS);

  const trimmedTitle = title.trim();
  const hasAnyDay = days.some(Boolean);
  const canSave = !addRoutine.isPending && trimmedTitle.length > 0 && hasAnyDay;

  function reset() {
    setOpen(false);
    setTitle("");
    setDays(ALL_DAYS);
  }

  if (!open) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setOpen(true)}
        leadingIcon={<Plus size={14} aria-hidden />}
        className="self-start"
      >
        Add routine
      </Button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSave) return;
        await addRoutine.mutateAsync({ title: trimmedTitle, repeatDays: days });
        reset();
      }}
      className="bg-surface-card border-surface-muted flex flex-col gap-2 rounded-md border p-3"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New routine title"
        autoFocus
      />
      <DayPicker value={days} onChange={setDays} />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          leadingIcon={<X size={14} aria-hidden />}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!canSave}>
          Add
        </Button>
      </div>
    </form>
  );
}
