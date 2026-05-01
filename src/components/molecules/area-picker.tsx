"use client";

import { cn } from "@/client/lib/cn";
import { AREA_KEYS, AREA_META, type Area } from "@/shared/areas";

type AreaPickerProps = {
  value: Area | null;
  onChange: (area: Area) => void;
  className?: string;
};

export function AreaPicker({ value, onChange, className }: AreaPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Life area"
      className={cn("grid grid-cols-3 gap-2 sm:grid-cols-4", className)}
    >
      {AREA_KEYS.map((area) => {
        const meta = AREA_META[area];
        const selected = value === area;
        return (
          <button
            key={area}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(area)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border-2 p-3 text-xs font-semibold transition-colors",
              "focus-visible:ring-brand-700 focus-visible:ring-2 focus-visible:outline-none",
              selected
                ? "text-white"
                : "bg-surface-card border-surface-muted text-brand-700 hover:border-brand-muted",
            )}
            style={
              selected
                ? {
                    background: `var(--color-area-${area})`,
                    borderColor: `var(--color-area-${area})`,
                  }
                : undefined
            }
          >
            <span className="text-lg" aria-hidden>
              {meta.icon}
            </span>
            <span>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
