"use client";

import { useState } from "react";

import { ApiError } from "@/client/api";
import { useSession } from "@/client/hooks";
import { BottomSheet, Button } from "@/components/atoms";
import { AREA_KEYS } from "@/shared/areas";
import type { WheelOfLifeDto } from "@/shared/schemas/user";

import { WHEEL_BUDGET, WheelOfLife } from "./wheel-of-life";

export type SetPrioritiesModalProps = {
  open: boolean;
  /**
   * Optional initial allocation. Defaults to all-zero. The modal locks once
   * submission succeeds, so this is mostly for restoring a draft state.
   */
  initial?: Partial<WheelOfLifeDto>;
  /** Called after a successful lock with the persisted wheel. */
  onLocked?: (wheel: WheelOfLifeDto) => void;
};

const EMPTY_WHEEL: WheelOfLifeDto = AREA_KEYS.reduce(
  (acc, area) => ({ ...acc, [area]: 0 }),
  {} as WheelOfLifeDto,
);

export function SetPrioritiesModal({ open, initial, onLocked }: SetPrioritiesModalProps) {
  const { lockPriorities } = useSession();
  const [values, setValues] = useState<WheelOfLifeDto>(() => ({ ...EMPTY_WHEEL, ...initial }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const used = AREA_KEYS.reduce((sum, key) => sum + (values[key] ?? 0), 0);
  const remaining = Math.max(0, WHEEL_BUDGET - used);
  const canSave = remaining === 0 && !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError(null);
    try {
      await lockPriorities(values);
      onLocked?.(values);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={() => undefined}
      title="Set your priorities"
      dismissable={false}
    >
      {/* Header */}
      <header className="flex-shrink-0 px-5 pt-3 pb-3">
        <h2 className="text-ink-strong text-center text-xl font-extrabold">Set your priorities</h2>
        <p className="text-ink-soft mt-1.5 px-1 text-center text-[12.5px] leading-snug">
          You have <strong className="text-brand-700">{WHEEL_BUDGET} points</strong> to invest
          across the seven areas of your life. Spend them on what matters most to you right now —
          these priorities shape your garden and stay locked in for a while, so be intentional.
        </p>
      </header>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-1 pb-3">
        <WheelOfLife values={values} onChange={setValues} />
      </div>

      {/* Footer */}
      <footer className="bg-surface-app border-surface-muted flex-shrink-0 border-t px-4 pt-3 pb-5">
        <Button type="button" size="lg" className="w-full" disabled={!canSave} onClick={handleSave}>
          {submitting
            ? "Saving…"
            : remaining === 0
              ? "🔒  Save and lock my priorities"
              : `Allocate ${remaining} more point${remaining === 1 ? "" : "s"}`}
        </Button>
        {error && (
          <p role="alert" className="text-health-critical mt-2 text-center text-xs font-semibold">
            {error}
          </p>
        )}
        <p className="text-brand-muted mt-2 text-center text-[11px] leading-snug">
          Once saved, your priorities are locked in. You can revisit them later from your profile.
        </p>
      </footer>
    </BottomSheet>
  );
}
