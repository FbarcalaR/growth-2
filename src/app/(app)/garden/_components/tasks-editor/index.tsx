"use client";

import type { Area } from "@/shared/areas";
import type { TaskDto } from "@/shared/schemas/goal";

import { AddTaskRow } from "./add-task-row";
import { TaskRowItem } from "./task-row-item";

type TasksEditorProps = {
  goalId: string;
  area: Area;
  tasks: TaskDto[];
};

/**
 * All tasks for one goal: list + inline add form. Each row owns its own
 * edit / delete state so this top-level stays declarative. Toggling routes
 * through the same `useUpdateTask` PATCH endpoint that Today uses, so the
 * domain rule (resource reward + plant grow) fires regardless of surface.
 */
export function TasksEditor({ goalId, area, tasks }: TasksEditorProps) {
  return (
    <section aria-label="Tasks" className="space-y-3">
      <h3 className="text-ink-strong text-xs font-bold tracking-wide uppercase">
        Tasks ({tasks.length})
      </h3>
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskRowItem goalId={goalId} area={area} task={task} />
          </li>
        ))}
      </ul>
      <AddTaskRow goalId={goalId} />
    </section>
  );
}
