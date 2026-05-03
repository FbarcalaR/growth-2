"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteTask, useUpdateTask } from "@/client/hooks";
import { TaskRow } from "@/components/molecules";
import type { Area } from "@/shared/areas";
import type { TaskDto } from "@/shared/schemas/goal";

import { TaskEditForm } from "./task-edit-form";

type TaskRowItemProps = {
  goalId: string;
  area: Area;
  task: TaskDto;
};

/** A single task in the list: checkbox toggle + edit / delete affordances. */
export function TaskRowItem({ goalId, area, task }: TaskRowItemProps) {
  const updateTask = useUpdateTask(goalId, task.id);
  const deleteTask = useDeleteTask(goalId);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <TaskEditForm goalId={goalId} task={task} onDone={() => setEditing(false)} />;
  }

  // Action icons are hidden until the row is hovered (pointer) or any of its
  // descendants gets focus (keyboard). On touch devices without hover, focus
  // still reveals them when the user tab-focuses the buttons. Real swipe-to-
  // reveal lands in the design-polish epic — tracked under 3.R.11 deferrals.
  return (
    <div className="group flex items-center gap-1">
      <div className="flex-1">
        <TaskRow
          title={task.title}
          completed={task.completed}
          area={area}
          dueLabel={task.dueDate ?? undefined}
          onToggle={(next) => updateTask.mutate({ completed: next })}
        />
      </div>
      <button
        type="button"
        aria-label={`Edit "${task.title}"`}
        onClick={() => setEditing(true)}
        className="text-brand-muted hover:text-brand-700 rounded-md p-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Pencil size={14} aria-hidden />
      </button>
      <button
        type="button"
        aria-label={`Delete "${task.title}"`}
        onClick={() => deleteTask.mutate(task.id)}
        className="text-brand-muted hover:text-health-critical rounded-md p-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash2 size={14} aria-hidden />
      </button>
    </div>
  );
}
