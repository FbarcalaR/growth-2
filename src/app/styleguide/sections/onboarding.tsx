"use client";

import { useState } from "react";

import { Button } from "@/components/atoms";
import { SetPrioritiesModal, WheelOfLife } from "@/components/organisms";
import { AREA_KEYS } from "@/shared/areas";
import type { WheelOfLifeDto } from "@/shared/schemas/user";

import { Section } from "../_components";

const EMPTY: WheelOfLifeDto = AREA_KEYS.reduce(
  (acc, area) => ({ ...acc, [area]: 0 }),
  {} as WheelOfLifeDto,
);

export function OnboardingSection() {
  const [wheel, setWheel] = useState<WheelOfLifeDto>(EMPTY);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-12">
      <Section title="Wheel of Life — inline">
        <div className="bg-surface-card border-surface-muted max-w-md rounded-md border p-5">
          <WheelOfLife values={wheel} onChange={setWheel} />
        </div>
      </Section>

      <Section title="Set Priorities modal">
        <div className="bg-surface-card border-surface-muted rounded-md border p-5">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <p className="text-brand-muted mt-2 text-xs">
            Note: this opens the real modal. It calls{" "}
            <code className="text-brand-700">PATCH /api/me/priorities</code> on save — works only
            after sign-in. The modal is intentionally non-dismissable.
          </p>
          <SetPrioritiesModal open={modalOpen} onLocked={() => setModalOpen(false)} />
        </div>
      </Section>
    </div>
  );
}
