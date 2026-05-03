"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useAddTask } from "@/client/hooks";
import { Button } from "@/components/atoms";

type AddTaskRowProps = {
  goalId: string;
};

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * "+ Add task" pill that toggles to an inline form (title + 📅 Due + Today
 * shortcut + Cancel / Add task). Matches the prototype's add-task drawer.
 */
export function AddTaskRow({ goalId }: AddTaskRowProps) {
  const addTask = useAddTask(goalId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>(todayISO());

  const trimmedTitle = title.trim();
  const canSave = !addTask.isPending && trimmedTitle.length > 0;

  function reset() {
    setOpen(false);
    setTitle("");
    setDueDate(todayISO());
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-pill border-input-border text-brand-700 inline-flex items-center gap-1.5 self-start border-[1.5px] bg-[#F8FBF8] px-3 py-2 text-[13px] font-semibold"
      >
        <Plus size={14} aria-hidden />
        Add task
      </button>
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
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          reset();
        }
      }}
      className="border-input-border flex flex-col gap-2 rounded-[14px] border bg-[#F8FBF8] p-3"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task…"
        className="border-input-border text-ink-strong focus:border-brand-700 w-full rounded-[10px] border-[1.5px] bg-white px-3 py-2.5 text-sm outline-none"
      />
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#7A8A7A]">📅 Due</span>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border-input-border text-ink-strong focus:border-brand-700 h-9 flex-1 rounded-[10px] border-[1.5px] bg-white px-2.5 text-[13px] outline-none"
        />
        <button
          type="button"
          onClick={() => setDueDate(todayISO())}
          className="border-input-border text-brand-700 rounded-[10px] border-[1.5px] bg-white px-2.5 py-1.5 text-[11px] font-bold"
        >
          Today
        </button>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-[10px] bg-[#F0F4EC] px-3.5 py-2 text-[13px] font-semibold text-[#7A8A7A]"
        >
          Cancel
        </button>
        <Button type="submit" size="sm" disabled={!canSave} className="rounded-[10px]">
          Add task
        </Button>
      </div>
    </form>
  );
}
