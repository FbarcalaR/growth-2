"use client";

import { useState } from "react";

import { cn } from "@/client/lib/cn";
import { AREA_DESCRIPTION, AREA_KEYS, AREA_META, type Area } from "@/shared/areas";
import type { WheelOfLifeDto } from "@/shared/schemas/user";

export const WHEEL_BUDGET = 30;

export type WheelOfLifeProps = {
  values: WheelOfLifeDto;
  onChange: (next: WheelOfLifeDto) => void;
  /** Total points to distribute. Defaults to 30. */
  budget?: number;
};

export function WheelOfLife({ values, onChange, budget = WHEEL_BUDGET }: WheelOfLifeProps) {
  const used = AREA_KEYS.reduce((sum, key) => sum + (values[key] ?? 0), 0);
  const remaining = Math.max(0, budget - used);
  const allocated = remaining === 0;

  const setVal = (key: Area, next: number) => {
    if (next < 0) return;
    const newUsed = used - (values[key] ?? 0) + next;
    if (newUsed > budget) return;
    onChange({ ...values, [key]: next });
  };

  return (
    <div className="space-y-3">
      <BudgetPill remaining={remaining} allocated={allocated} />
      <ul className="flex flex-col gap-2" aria-label="Life-area priorities">
        {AREA_KEYS.map((area) => (
          <PriorityRow
            key={area}
            area={area}
            value={values[area] ?? 0}
            canIncrement={remaining > 0}
            onChange={(v) => setVal(area, v)}
          />
        ))}
      </ul>
    </div>
  );
}

function BudgetPill({ remaining, allocated }: { remaining: number; allocated: boolean }) {
  return (
    <div className="flex justify-center" aria-live="polite">
      <div
        className={cn(
          "rounded-pill flex items-center gap-2 border-[1.5px] px-4 py-2 transition-colors",
          allocated
            ? "bg-brand-700 border-brand-700 text-white"
            : "bg-surface-card border-brand-track text-ink-strong",
        )}
      >
        <span className="text-[11px] font-semibold tracking-[0.4px] uppercase opacity-75">
          Budget left
        </span>
        <span className="text-xl leading-none font-extrabold tabular-nums">{remaining}</span>
      </div>
    </div>
  );
}

type PriorityRowProps = {
  area: Area;
  value: number;
  canIncrement: boolean;
  onChange: (v: number) => void;
};

function PriorityRow({ area, value, canIncrement, onChange }: PriorityRowProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const meta = AREA_META[area];
  const minusDisabled = value <= 0;
  const plusDisabled = !canIncrement;

  return (
    <li className="bg-surface-card border-surface-muted rounded-md border px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-lg"
          // 22 = ~13% alpha to match the prototype's `area.color + "22"`
          style={{ background: `color-mix(in srgb, var(--color-area-${area}) 13%, transparent)` }}
        >
          {meta.icon}
        </span>

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="text-ink-strong text-sm font-bold">{meta.label}</span>
          <button
            type="button"
            onClick={() => setInfoOpen((prev) => !prev)}
            aria-label={`About ${meta.label}`}
            aria-expanded={infoOpen}
            className={cn(
              "rounded-pill flex h-[18px] w-[18px] items-center justify-center text-[11px] leading-none font-extrabold transition-colors",
              infoOpen ? "bg-brand-700 text-white" : "bg-surface-muted text-brand-muted",
            )}
          >
            i
          </button>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <Stepper
            kind="minus"
            disabled={minusDisabled}
            onClick={() => onChange(value - 1)}
            label={`Decrease ${meta.label}`}
          />
          <div
            className="text-ink-strong min-w-[28px] text-center text-lg font-extrabold tabular-nums"
            aria-label={`${meta.label} priority`}
          >
            {value}
          </div>
          <Stepper
            kind="plus"
            disabled={plusDisabled}
            onClick={() => onChange(value + 1)}
            label={`Increase ${meta.label}`}
          />
        </div>
      </div>

      {infoOpen && (
        <p className="bg-surface-app text-ink-soft mt-2 rounded-[9px] px-2.5 py-2 text-xs leading-snug">
          {AREA_DESCRIPTION[area]}
        </p>
      )}
    </li>
  );
}

function Stepper({
  kind,
  disabled,
  onClick,
  label,
}: {
  kind: "plus" | "minus";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "rounded-pill flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center text-lg leading-none font-bold transition-transform active:scale-95",
        "focus-visible:ring-brand-700 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
        kind === "plus"
          ? disabled
            ? "bg-brand-track text-brand-muted"
            : "bg-brand-700 text-white"
          : disabled
            ? "bg-surface-muted text-brand-track"
            : "bg-brand-100 text-brand-700",
      )}
    >
      {kind === "plus" ? "+" : "−"}
    </button>
  );
}
