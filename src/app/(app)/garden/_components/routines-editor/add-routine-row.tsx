"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useAddRoutine } from "@/client/hooks";
import { Button } from "@/components/atoms";
import { ALL_DAYS, DayPicker, type RepeatDays } from "@/components/molecules";

type AddRoutineRowProps = {
  goalId: string;
};

const WEEKDAYS: RepeatDays = [true, true, true, true, true, false, false];

/** Toggleable "+ Add routine" pill + inline form (title + 🔁 day picker + presets). */
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-pill border-input-border text-brand-700 inline-flex items-center gap-1.5 self-start border-[1.5px] bg-[#F8FBF8] px-3 py-2 text-[13px] font-semibold"
      >
        <Plus size={14} aria-hidden />
        Add routine
      </button>
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
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          reset();
        }
      }}
      className="border-input-border flex flex-col gap-2.5 rounded-[14px] border bg-[#F8FBF8] p-3"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Daily routine…"
        className="border-input-border text-ink-strong focus:border-brand-700 w-full rounded-[10px] border-[1.5px] bg-white px-3 py-2.5 text-sm outline-none"
      />
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#7A8A7A]">🔁 Repeat on</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setDays(ALL_DAYS)}
              className="border-input-border text-brand-700 rounded-[8px] border bg-white px-2 py-0.5 text-[10px] font-bold"
            >
              Every day
            </button>
            <button
              type="button"
              onClick={() => setDays(WEEKDAYS)}
              className="border-input-border text-brand-700 rounded-[8px] border bg-white px-2 py-0.5 text-[10px] font-bold"
            >
              Weekdays
            </button>
          </div>
        </div>
        <DayPicker value={days} onChange={setDays} />
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
          Add routine
        </Button>
      </div>
    </form>
  );
}
