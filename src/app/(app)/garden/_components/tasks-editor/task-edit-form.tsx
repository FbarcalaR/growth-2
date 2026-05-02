"use client";

import { useState } from "react";

import { useUpdateTask } from "@/client/hooks";
import { Button, Input } from "@/components/atoms";
import type { TaskDto } from "@/shared/schemas/goal";

type TaskEditFormProps = {
  goalId: string;
  task: TaskDto;
  onDone: () => void;
};

/** Inline title + due-date editor. Renders in place of a TaskRowItem. */
export function TaskEditForm({ goalId, task, onDone }: TaskEditFormProps) {
  const updateTask = useUpdateTask(goalId, task.id);
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState<string>(task.dueDate ?? "");
  const trimmedTitle = title.trim();
  const canSave = !updateTask.isPending && trimmedTitle.length > 0;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!canSave) return;
        await updateTask.mutateAsync({
          title: trimmedTitle || task.title,
          dueDate: dueDate || null,
        });
        onDone();
      }}
      className="bg-surface-card border-surface-muted flex flex-col gap-2 rounded-md border p-3"
    >
      <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
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
          onClick={onDone}
          disabled={updateTask.isPending}
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
