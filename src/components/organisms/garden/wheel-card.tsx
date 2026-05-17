"use client";

import type { AreaSlots } from "@/client/hooks";
import type { WheelOfLifeDto } from "@/shared/schemas/user";

import { WheelChart } from "./wheel-chart";

type WheelCardProps = {
  values: WheelOfLifeDto;
  slots: AreaSlots;
};

/**
 * Card wrapper around `<WheelChart>` matching the visual chrome of
 * `<GardenCard>` (same rounded border + header) so the two slot into the
 * Garden tab carousel without visual drift.
 */
export function WheelCard({ values, slots }: WheelCardProps) {
  return (
    <div className="bg-surface-card border-surface-muted overflow-hidden rounded-[20px] border-[1.5px]">
      <div className="px-3.5 pt-3.5 pb-1">
        <p className="text-ink-strong text-[17px] font-extrabold">Wheel of life</p>
        <p className="text-brand-muted text-[11px]">Priorities vs. what you actually have</p>
      </div>
      <WheelChart values={values} slots={slots} />
    </div>
  );
}
