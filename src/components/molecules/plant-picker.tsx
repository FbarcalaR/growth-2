"use client";

import { cn } from "@/client/lib/cn";
import { PlantSprite } from "@/components/atoms";
import { PLANT_IDS, PLANT_LABELS, type PlantId } from "@/shared/plants";

type PlantPickerProps = {
  value: PlantId;
  onChange: (plantId: PlantId) => void;
  className?: string;
};

export function PlantPicker({ value, onChange, className }: PlantPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Plant kind"
      className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4", className)}
    >
      {PLANT_IDS.map((plantId) => {
        const selected = value === plantId;
        return (
          <button
            key={plantId}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={PLANT_LABELS[plantId]}
            onClick={() => onChange(plantId)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border-2 p-2 text-xs font-semibold transition-colors",
              "focus-visible:ring-brand-700 focus-visible:ring-2 focus-visible:outline-none",
              selected
                ? "border-brand-700 bg-brand-100 text-brand-700"
                : "bg-surface-card border-surface-muted text-brand-700 hover:border-brand-muted",
            )}
          >
            <span aria-hidden>
              <PlantSprite plantId={plantId} stage={3} size={40} />
            </span>
            <span aria-hidden>{PLANT_LABELS[plantId]}</span>
          </button>
        );
      })}
    </div>
  );
}
