"use client";

import { cn } from "@/client/lib/cn";

export type RepeatDays = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"] as const;
const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type DayPickerProps = {
  value: RepeatDays;
  onChange: (next: RepeatDays) => void;
  className?: string;
};

/**
 * Mon-Sun toggle row used by the routine editor. Each button is a labelled
 * checkbox so screen readers announce the day name + state.
 */
export function DayPicker({ value, onChange, className }: DayPickerProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {DAY_LETTERS.map((letter, i) => {
        const selected = value[i] ?? false;
        return (
          <button
            key={i}
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={DAY_NAMES[i]}
            onClick={() => onChange(toggleAt(value, i))}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
              "focus-visible:ring-brand-700 focus-visible:ring-2 focus-visible:outline-none",
              selected
                ? "bg-brand-700 border-brand-700 text-white"
                : "bg-surface-card border-surface-muted text-brand-muted hover:border-brand-muted",
            )}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

export const ALL_DAYS: RepeatDays = [true, true, true, true, true, true, true];
export const NO_DAYS: RepeatDays = [false, false, false, false, false, false, false];

function toggleAt(days: RepeatDays, index: number): RepeatDays {
  const arr = [...days];
  arr[index] = !arr[index];
  return arr as unknown as RepeatDays;
}
