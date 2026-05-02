"use client";

import { useState } from "react";

import { ApiError } from "@/client/api";
import { BottomSheet, Button, Input, Spinner } from "@/components/atoms";
import { AreaPicker, PlantPicker } from "@/components/molecules";
import { type Area } from "@/shared/areas";
import { AREA_DEFAULT_PLANT, type PlantId } from "@/shared/plants";

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
 * Bottom-sheet form to create or edit a goal. Title + area + plant kind in
 * create mode; in edit mode the area is locked (changing it would re-route
 * resources between plant kinds, which the domain doesn't support cleanly)
 * but title and plant kind are still editable.
 *
 * Form state lives in the inner `<Body>` so that closing the sheet unmounts
 * it and the next open starts from a clean draft — no `useEffect` resets,
 * no stale fields between invocations.
 */
export function GoalEditor(props: GoalEditorProps) {
  return (
    <BottomSheet
      open={props.open}
      onClose={props.onClose}
      title={props.mode === "create" ? "New goal" : "Edit goal"}
    >
      <Body {...props} />
    </BottomSheet>
  );
}

function Body(props: GoalEditorProps) {
  const initialTitle = props.mode === "edit" ? props.initial.title : "";
  const initialArea = props.mode === "edit" ? props.initial.area : null;
  const initialPlant = props.mode === "edit" ? props.initial.plantType : null;

  const [title, setTitle] = useState(initialTitle);
  const [area, setArea] = useState<Area | null>(initialArea);
  // Null = "let the area decide". Once the user picks an area in create mode,
  // the effective plant defaults to that area's recommendation; the user can
  // then override by tapping a plant in the picker.
  const [plantOverride, setPlantOverride] = useState<PlantId | null>(initialPlant);
  const effectivePlant: PlantId | null = plantOverride ?? (area ? AREA_DEFAULT_PLANT[area] : null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = title.trim();
  const canSave =
    !submitting &&
    trimmed.length >= 1 &&
    trimmed.length <= MAX_TITLE &&
    effectivePlant !== null &&
    (props.mode === "edit" || area !== null);

  async function handleSubmit() {
    if (!canSave || !effectivePlant) return;
    setSubmitting(true);
    setError(null);
    try {
      if (props.mode === "create") {
        if (!area) return;
        await props.onSubmit({ title: trimmed, area, plantType: effectivePlant });
      } else {
        await props.onSubmit({ title: trimmed, plantType: effectivePlant });
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
    <>
      <header className="border-surface-muted border-b px-5 py-4">
        <h2 className="text-ink-strong text-lg font-extrabold">
          {props.mode === "create" ? "New goal" : "Edit goal"}
        </h2>
        <p className="text-brand-muted mt-0.5 text-xs">
          {props.mode === "create"
            ? "Each goal grows a unique plant in your garden."
            : "Tweak the title or pick a different plant."}
        </p>
      </header>

      <div className="space-y-5 overflow-y-auto px-5 py-5">
        <label className="block">
          <span className="text-ink-strong mb-1 block text-xs font-bold tracking-wide uppercase">
            Goal
          </span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Run a 5K"
            maxLength={MAX_TITLE}
            invalid={trimmed.length > MAX_TITLE}
          />
        </label>

        {props.mode === "create" && (
          <div>
            <span className="text-ink-strong mb-1 block text-xs font-bold tracking-wide uppercase">
              Life area
            </span>
            <AreaPicker value={area} onChange={setArea} />
          </div>
        )}

        {effectivePlant !== null && (
          <div>
            <span className="text-ink-strong mb-1 block text-xs font-bold tracking-wide uppercase">
              Plant
            </span>
            <PlantPicker value={effectivePlant} onChange={setPlantOverride} />
          </div>
        )}

        {error && (
          <p role="alert" className="text-health-critical text-xs font-semibold">
            {error}
          </p>
        )}
      </div>

      <footer className="border-surface-muted flex items-center justify-end gap-2 border-t px-5 py-3">
        <Button variant="ghost" onClick={props.onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSave}>
          {submitting && <Spinner size="sm" />}
          <span>{props.mode === "create" ? "Plant goal" : "Save changes"}</span>
        </Button>
      </footer>
    </>
  );
}
