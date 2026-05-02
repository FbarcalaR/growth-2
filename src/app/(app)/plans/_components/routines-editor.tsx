"use client";

import { Award, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import {
  useAddRoutine,
  useCompleteRoutinePermanent,
  useDeleteRoutine,
  useUpdateRoutine,
} from "@/client/hooks";
import { Button, Input } from "@/components/atoms";
import {
  ALL_DAYS,
  ConfirmDialog,
  DayPicker,
  RoutineRow,
  type RepeatDays,
} from "@/components/molecules";
import type { Area } from "@/shared/areas";
import type { RoutineDto } from "@/shared/schemas/goal";

type RoutinesEditorProps = {
  goalId: string;
  area: Area;
  routines: RoutineDto[];
};

export function RoutinesEditor({ goalId, area, routines }: RoutinesEditorProps) {
  return (
    <section aria-label="Routines" className="mt-5 space-y-3">
      <h3 className="text-ink-strong text-xs font-bold tracking-wide uppercase">
        Routines ({routines.length})
      </h3>
      <ul className="flex flex-col gap-2">
        {routines.map((routine) => (
          <li key={routine.id}>
            <RoutineRowItem goalId={goalId} area={area} routine={routine} />
          </li>
        ))}
      </ul>
      <AddRoutineRow goalId={goalId} />
    </section>
  );
}

function RoutineRowItem({
  goalId,
  area,
  routine,
}: {
  goalId: string;
  area: Area;
  routine: RoutineDto;
}) {
  const updateRoutine = useUpdateRoutine(goalId, routine.id);
  const deleteRoutine = useDeleteRoutine(goalId);
  const completePermanent = useCompleteRoutinePermanent(goalId);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(routine.title);
  const [days, setDays] = useState<RepeatDays>(routine.repeatDays);
  const [confirmGraduate, setConfirmGraduate] = useState(false);

  if (editing) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!days.some(Boolean)) return;
          await updateRoutine.mutateAsync({
            title: title.trim() || routine.title,
            repeatDays: days,
          });
          setEditing(false);
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
            onClick={() => setEditing(false)}
            disabled={updateRoutine.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={updateRoutine.isPending || title.trim() === "" || !days.some(Boolean)}
          >
            Save
          </Button>
        </div>
      </form>
    );
  }

  if (routine.permanentlyCompleted) {
    return (
      <div className="bg-surface-card border-surface-muted flex items-center gap-3 rounded-md border p-3">
        <Award size={18} className="text-area-fun" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-brand-700 truncate text-sm font-semibold line-through">
            {routine.title}
          </p>
          <p className="text-brand-muted text-xs">Graduated · {routine.streak}-day streak kept</p>
        </div>
        <button
          type="button"
          aria-label={`Delete "${routine.title}"`}
          onClick={() => deleteRoutine.mutate(routine.id)}
          className="text-brand-muted hover:text-health-critical rounded-md p-1.5"
        >
          <Trash2 size={14} aria-hidden />
        </button>
      </div>
    );
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

function AddRoutineRow({ goalId }: { goalId: string }) {
  const addRoutine = useAddRoutine(goalId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [days, setDays] = useState<RepeatDays>(ALL_DAYS);

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
        const trimmed = title.trim();
        if (!trimmed || !days.some(Boolean)) return;
        await addRoutine.mutateAsync({ title: trimmed, repeatDays: days });
        setTitle("");
        setDays(ALL_DAYS);
        setOpen(false);
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
          onClick={() => {
            setOpen(false);
            setTitle("");
            setDays(ALL_DAYS);
          }}
          leadingIcon={<X size={14} aria-hidden />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={addRoutine.isPending || title.trim() === "" || !days.some(Boolean)}
        >
          Add
        </Button>
      </div>
    </form>
  );
}
