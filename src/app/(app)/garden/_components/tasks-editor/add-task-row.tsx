"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { useAddTask } from "@/client/hooks";
import { Button, Input } from "@/components/atoms";

type AddTaskRowProps = {
  goalId: string;
};

/** Toggleable "Add task" button + inline form. Owns its own draft state. */
export function AddTaskRow({ goalId }: AddTaskRowProps) {
  const addTask = useAddTask(goalId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>("");

  const trimmedTitle = title.trim();
  const canSave = !addTask.isPending && trimmedTitle.length > 0;

  function reset() {
    setOpen(false);
    setTitle("");
    setDueDate("");
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
        Add task
      </Button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSave) return;
        await addTask.mutateAsync({ title: trimmedTitle, dueDate: dueDate || null });
        reset();
      }}
      className="bg-surface-card border-surface-muted flex flex-col gap-2 rounded-md border p-3"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task title"
        autoFocus
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="bg-surface-card border-surface-muted text-brand-700 h-9 rounded-md border px-2 text-sm"
      />
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
