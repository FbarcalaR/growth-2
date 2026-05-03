"use client";

import { useState } from "react";

import { ApiError } from "@/client/api";
import { useAreaSlots, type AreaSlots } from "@/client/hooks";
import { BottomSheet, Button, PlantSprite, Spinner } from "@/components/atoms";
import { cn } from "@/client/lib/cn";
import { AREA_KEYS, AREA_META, type Area } from "@/shared/areas";
import { AREA_DEFAULT_PLANT, PLANT_IDS, PLANT_LABELS, type PlantId } from "@/shared/plants";

type GoalEditorMode =
  | {
      mode: "create";
      onSubmit: (input: { title: string; area: Area; plantType: PlantId }) => Promise<void>;
    }
  | {
      mode: "edit";
      initial: { title: string; area: Area; plantType: PlantId };
      onSubmit: (input: { title: string; plantType: PlantId }) => Promise<void>;
    };

type GoalEditorProps = {
  open: boolean;
  onClose: () => void;
} & GoalEditorMode;

const MAX_TITLE = 120;

/**
 * Two-step bottom-sheet form ported from the prototype's `NewGoalModal`.
 *
 *   Step 0  →  Title + Life Area chips (with slot quotas).
 *   Step 1  →  Plant grid (defaults from the chosen area, overridable).
 *
 * Edit mode skips Step 0 entirely (area is locked because changing it would
 * re-route resources between plant kinds, which the domain doesn't support
 * cleanly) and shows just the title + plant grid in one step.
 *
 * State lives in the inner `<Body>` so closing the sheet unmounts it and the
 * next open is a clean draft — no `useEffect` resets needed.
 */
export function GoalEditor(props: GoalEditorProps) {
  return (
    <BottomSheet
      open={props.open}
      onClose={props.onClose}
      title={props.mode === "create" ? "New goal" : "Edit goal"}
      className="bg-surface-card"
    >
      <Body {...props} />
    </BottomSheet>
  );
}

function Body(props: GoalEditorProps) {
  const slots = useAreaSlots();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialArea = props.mode === "edit" ? props.initial.area : firstOpenArea(slots);
  const initialTitle = props.mode === "edit" ? props.initial.title : "";
  const initialPlant =
    props.mode === "edit" ? props.initial.plantType : AREA_DEFAULT_PLANT[initialArea];

  const [step, setStep] = useState<0 | 1>(props.mode === "edit" ? 1 : 0);
  const [title, setTitle] = useState(initialTitle);
  const [area, setArea] = useState<Area>(initialArea);
  const [plantType, setPlantType] = useState<PlantId>(initialPlant);

  // In create mode, when the area changes, default the plant to that area's
  // recommended kind. The user can override after.
  function selectArea(next: Area) {
    setArea(next);
    if (props.mode === "create") setPlantType(AREA_DEFAULT_PLANT[next]);
  }

  const trimmed = title.trim();
  const titleValid = trimmed.length >= 1 && trimmed.length <= MAX_TITLE;
  const slot = slots[area];
  const areaBlocked = props.mode === "create" && (slot.locked || slot.full);
  const canAdvance = titleValid && !areaBlocked;

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (props.mode === "create") {
        await props.onSubmit({ title: trimmed, area, plantType });
      } else {
        await props.onSubmit({ title: trimmed, plantType });
      }
      props.onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 pt-3 pb-9">
      {step === 0 ? (
        <CreateStep0
          title={title}
          onTitleChange={setTitle}
          area={area}
          onAreaChange={selectArea}
          slots={slots}
          canAdvance={canAdvance}
          onNext={() => setStep(1)}
        />
      ) : (
        <CreateStep1
          mode={props.mode}
          title={title}
          onTitleChange={setTitle}
          area={area}
          plantType={plantType}
          onPlantChange={setPlantType}
          onBack={props.mode === "create" ? () => setStep(0) : null}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitDisabled={!titleValid || submitting}
          submitLabel={props.mode === "create" ? "Add as seed 🌰" : "Save changes"}
          error={error}
        />
      )}
    </div>
  );
}

// ─── Step 0: title + area ───────────────────────────────────────────────────

function CreateStep0({
  title,
  onTitleChange,
  area,
  onAreaChange,
  slots,
  canAdvance,
  onNext,
}: {
  title: string;
  onTitleChange: (next: string) => void;
  area: Area;
  onAreaChange: (next: Area) => void;
  slots: AreaSlots;
  canAdvance: boolean;
  onNext: () => void;
}) {
  const slot = slots[area];
  const blocked = slot.locked || slot.full;
  const nextLabel = blocked
    ? slot.locked
      ? "Area locked — pick another"
      : "Area full — drop one to continue"
    : "Next: Choose your plant →";

  return (
    <>
      <h2 className="text-ink-strong text-lg font-bold">New Life Goal</h2>
      <p className="text-brand-muted mt-1 text-[13px]">
        Goals are the heart of your journey. Each one grows a plant 🌱
      </p>

      <input
        autoFocus
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && title.trim() && !blocked) onNext();
        }}
        placeholder="What do you want to achieve?"
        className="border-input-border text-ink-strong focus:border-brand-700 mt-4 w-full rounded-[14px] border-[1.5px] px-4 py-3.5 text-[15px] outline-none"
      />

      <div className="mt-5">
        <div className="mb-2.5 flex items-end justify-between">
          <span className="text-[12px] font-semibold tracking-wide text-[#7A8A7A] uppercase">
            Life Area
          </span>
          <span className="text-brand-muted text-[10px] font-semibold">
            Slots = priority points
          </span>
        </div>
        <div className="flex flex-wrap gap-[7px]">
          {AREA_KEYS.map((key) => (
            <AreaSlotChip
              key={key}
              area={key}
              selected={area === key}
              slot={slots[key]}
              onClick={() => onAreaChange(key)}
            />
          ))}
        </div>

        {blocked && <BlockedAreaHint area={area} slot={slot} />}
      </div>

      <Button
        size="lg"
        onClick={onNext}
        disabled={!canAdvance}
        className="mt-5 w-full rounded-[16px]"
      >
        {nextLabel}
      </Button>
    </>
  );
}

function AreaSlotChip({
  area,
  selected,
  slot,
  onClick,
}: {
  area: Area;
  selected: boolean;
  slot: { quota: number; used: number; locked: boolean; full: boolean };
  onClick: () => void;
}) {
  const meta = AREA_META[area];
  const dim = !selected && (slot.locked || slot.full);

  // Per-area background and text colour use `color-mix(...)` so we don't need
  // to duplicate seven palettes; selected/dim/default each have a clear look.
  const containerStyle: React.CSSProperties = selected
    ? {
        borderColor: `var(--color-area-${area})`,
        background: `color-mix(in srgb, var(--color-area-${area}) 13%, white)`,
        color: `var(--color-area-${area})`,
      }
    : dim
      ? { borderColor: "#E0E5DE", background: "#F4F6F2", color: "#B5BEB5" }
      : { borderColor: "#EAEDE8", background: "#FAFAFA", color: "#9EB09E" };

  const counterStyle: React.CSSProperties = selected
    ? { background: `var(--color-area-${area})`, color: "#fff" }
    : slot.locked
      ? { background: "#E8EDE5", color: "#9EB09E" }
      : slot.full
        ? { background: "#FBE3E5", color: "#C9484E" }
        : { background: "#E8F0E8", color: "#3A6647" };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill inline-flex items-center gap-1.5 border-2 px-3 py-2 text-xs font-semibold transition-colors",
        "focus-visible:ring-brand-700 focus-visible:ring-2 focus-visible:outline-none",
      )}
      style={containerStyle}
    >
      <span>
        {meta.icon} {meta.label}
      </span>
      <span
        className="rounded px-1.5 py-[1px] text-[10px] font-extrabold tabular-nums"
        style={counterStyle}
      >
        {slot.locked ? "🔒" : `${slot.used}/${slot.quota}`}
      </span>
    </button>
  );
}

function BlockedAreaHint({
  area,
  slot,
}: {
  area: Area;
  slot: { quota: number; used: number; locked: boolean; full: boolean };
}) {
  const meta = AREA_META[area];
  if (slot.locked) {
    return (
      <div className="mt-3 rounded-xl border border-[#E0E5DE] bg-[#F4F6F2] p-3">
        <p className="text-ink-strong text-xs font-bold">
          🔒 No slots in <span style={{ color: `var(--color-area-${area})` }}>{meta.label}</span>
        </p>
        <p className="mt-1 text-[11.5px] leading-snug text-[#5A6A5A]">
          You assigned <strong>0 priority points</strong> to this area in your wheel of life, so
          it&rsquo;s not part of your focus right now. Raise its priority from your profile to
          create goals here.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-3 rounded-xl border border-[#F5D7D9] bg-[#FFF6F6] p-3">
      <p className="text-ink-strong text-xs font-bold">
        ⚠️ <span style={{ color: `var(--color-area-${area})` }}>{meta.label}</span> is full (
        {slot.used}/{slot.quota})
      </p>
      <p className="mt-1 text-[11.5px] leading-snug text-[#5A6A5A]">
        Your priority of{" "}
        <strong>
          {slot.quota} point{slot.quota === 1 ? "" : "s"}
        </strong>{" "}
        on {meta.label} caps you at {slot.quota} active goal{slot.quota === 1 ? "" : "s"}. Drop one
        first or pick a different area.
      </p>
    </div>
  );
}

// ─── Step 1: plant grid ─────────────────────────────────────────────────────

function CreateStep1({
  mode,
  title,
  onTitleChange,
  area,
  plantType,
  onPlantChange,
  onBack,
  onSubmit,
  submitting,
  submitDisabled,
  submitLabel,
  error,
}: {
  mode: "create" | "edit";
  title: string;
  onTitleChange: (next: string) => void;
  area: Area;
  plantType: PlantId;
  onPlantChange: (next: PlantId) => void;
  onBack: (() => void) | null;
  onSubmit: () => void;
  submitting: boolean;
  submitDisabled: boolean;
  submitLabel: string;
  error: string | null;
}) {
  const meta = AREA_META[area];
  return (
    <>
      {onBack && (
        <button type="button" onClick={onBack} className="text-brand-muted mb-3 text-[13px]">
          ← Back
        </button>
      )}
      <h2 className="text-ink-strong text-lg font-bold">
        {mode === "create" ? "Choose Your Plant" : "Edit goal"}
      </h2>
      <p className="text-brand-muted mt-1 text-[13px]">
        {mode === "create" ? (
          <>
            This plant will grow in your garden as you work on{" "}
            <strong className="text-ink-strong">{title.trim() || "your goal"}</strong>
          </>
        ) : (
          "Tweak the title or pick a different plant."
        )}
      </p>

      {mode === "edit" && (
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Goal title"
          className="border-input-border text-ink-strong focus:border-brand-700 mt-4 w-full rounded-[14px] border-[1.5px] px-4 py-3.5 text-[15px] outline-none"
        />
      )}

      <div
        className="mt-3 flex items-center gap-1.5 rounded-[10px] border px-3 py-2"
        style={{
          background: `color-mix(in srgb, var(--color-area-${area}) 8%, white)`,
          borderColor: `color-mix(in srgb, var(--color-area-${area}) 20%, white)`,
        }}
      >
        <span className="text-xs">{meta.icon}</span>
        <span className="text-xs font-semibold" style={{ color: `var(--color-area-${area})` }}>
          {meta.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {PLANT_IDS.map((id) => (
          <PlantOption
            key={id}
            plantId={id}
            label={PLANT_LABELS[id]}
            selected={plantType === id}
            onClick={() => onPlantChange(id)}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="text-health-critical mt-3 text-xs font-semibold">
          {error}
        </p>
      )}

      <Button
        size="lg"
        onClick={onSubmit}
        disabled={submitDisabled}
        className="mt-5 w-full rounded-[16px]"
      >
        {submitting && <Spinner size="sm" />}
        <span>{submitLabel}</span>
      </Button>
    </>
  );
}

function PlantOption({
  plantId,
  label,
  selected,
  onClick,
}: {
  plantId: PlantId;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded-2xl border-2 p-3 text-center transition-colors",
        "focus-visible:ring-brand-700 focus-visible:ring-2 focus-visible:outline-none",
        selected
          ? "border-brand-700 bg-brand-100"
          : "border-surface-muted hover:border-brand-muted bg-[#FAFAFA]",
      )}
    >
      <span aria-hidden className="block">
        <PlantSprite plantId={plantId} stage={3} size={60} />
      </span>
      <span
        aria-hidden
        className={cn(
          "mt-1 block text-[13px] font-bold",
          selected ? "text-brand-700" : "text-ink-strong",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function firstOpenArea(slots: AreaSlots): Area {
  const open = AREA_KEYS.find((k) => !slots[k].locked && !slots[k].full);
  return open ?? "health";
}
