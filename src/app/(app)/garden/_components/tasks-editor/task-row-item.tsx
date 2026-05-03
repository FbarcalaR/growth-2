"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteTask, useUpdateTask } from "@/client/hooks";
import { SwipeableRow, TaskRow, type SwipeAction } from "@/components/molecules";
import type { Area } from "@/shared/areas";
import type { TaskDto } from "@/shared/schemas/goal";

import { TaskEditForm } from "./task-edit-form";

type TaskRowItemProps = {
  goalId: string;
  area: Area;
  task: TaskDto;
};

/**
 * One task in the list. Renders inside `<SwipeableRow>` so the row itself
 * is 100% wide; Edit / Delete are revealed when the user swipes left.
 * Tapping the row body toggles completion (same PATCH path as Today).
 */
export function TaskRowItem({ goalId, area, task }: TaskRowItemProps) {
  const updateTask = useUpdateTask(goalId, task.id);
  const deleteTask = useDeleteTask(goalId);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <TaskEditForm goalId={goalId} task={task} onDone={() => setEditing(false)} />;
  }

  const actions: SwipeAction[] = [
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
      onClick: () => deleteTask.mutate(task.id),
    },
  ];

  return (
    <SwipeableRow
      actions={actions}
      onPress={() => updateTask.mutate({ completed: !task.completed })}
    >
      <TaskRow
        title={task.title}
        completed={task.completed}
        area={area}
        dueLabel={task.dueDate ?? undefined}
        // Swipeable wrapper owns the toggle on press; the inner checkbox
        // exists for visual / a11y, no-op so a tap doesn't double-fire.
        onToggle={() => undefined}
        className="rounded-md border-0"
      />
    </SwipeableRow>
  );
}
