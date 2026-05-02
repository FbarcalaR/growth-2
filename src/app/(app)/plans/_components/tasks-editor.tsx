"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import { useAddTask, useDeleteTask, useUpdateTask } from "@/client/hooks";
import { Button, Input } from "@/components/atoms";
import { TaskRow } from "@/components/molecules";
import type { Area } from "@/shared/areas";
import type { TaskDto } from "@/shared/schemas/goal";

type TasksEditorProps = {
  goalId: string;
  area: Area;
  tasks: TaskDto[];
};

/**
 * Renders all tasks for a goal with inline add / edit / delete and the same
 * checkbox-toggle endpoint as Today. Lives inside `<GoalDetailSheet>`'s
 * children slot — the sheet handles open/close, this component owns the
 * tasks-only state machine.
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

function TaskRowItem({ goalId, area, task }: { goalId: string; area: Area; task: TaskDto }) {
  const updateTask = useUpdateTask(goalId, task.id);
  const deleteTask = useDeleteTask(goalId);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState<string>(task.dueDate ?? "");

  if (editing) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await updateTask.mutateAsync({
            title: title.trim() || task.title,
            dueDate: dueDate || null,
          });
          setEditing(false);
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
            onClick={() => setEditing(false)}
            disabled={updateTask.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={updateTask.isPending || title.trim() === ""}>
            Save
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
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
        className="text-brand-muted hover:text-brand-700 rounded-md p-1.5"
      >
        <Pencil size={14} aria-hidden />
      </button>
      <button
        type="button"
        aria-label={`Delete "${task.title}"`}
        onClick={() => deleteTask.mutate(task.id)}
        className="text-brand-muted hover:text-health-critical rounded-md p-1.5"
      >
        <Trash2 size={14} aria-hidden />
      </button>
    </div>
  );
}

function AddTaskRow({ goalId }: { goalId: string }) {
  const addTask = useAddTask(goalId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>("");

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
        const trimmed = title.trim();
        if (!trimmed) return;
        await addTask.mutateAsync({ title: trimmed, dueDate: dueDate || null });
        setTitle("");
        setDueDate("");
        setOpen(false);
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
          onClick={() => {
            setOpen(false);
            setTitle("");
            setDueDate("");
          }}
          leadingIcon={<X size={14} aria-hidden />}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={addTask.isPending || title.trim() === ""}>
          Add
        </Button>
      </div>
    </form>
  );
}
