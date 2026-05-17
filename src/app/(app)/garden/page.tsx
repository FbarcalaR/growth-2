"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useAreaSlots,
  useCreateGoal,
  useGarden,
  useGoals,
  usePlaceDeco,
  usePlantOnTile,
  useSession,
} from "@/client/hooks";
import { Button, Spinner } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";
import {
  DecoShopSheet,
  GardenCard,
  GoalCard,
  GoalDetailSheet,
  GoalEditor,
  PlantNowSheet,
  TrophiesSheet,
  WheelCard,
} from "@/components/organisms";
import type { DecoId } from "@/components/organisms";
import type { GoalDto } from "@/shared/schemas/goal";

import { EmptyState } from "./_components/empty-state";
import { RoutinesEditor } from "./_components/routines-editor";
import { TasksEditor } from "./_components/tasks-editor";

type TopView = "garden" | "wheel";

export default function GardenPage() {
  const { user } = useSession();
  const goals = useGoals();
  const garden = useGarden();
  const slots = useAreaSlots();
  const createGoal = useCreateGoal();
  const plantOnTile = usePlantOnTile();
  const placeDeco = usePlaceDeco();
  const [editorOpen, setEditorOpen] = useState(false);
  const [openGoalId, setOpenGoalId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [trophiesOpen, setTrophiesOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [placingGoalId, setPlacingGoalId] = useState<string | null>(null);
  const [placingDeco, setPlacingDeco] = useState<DecoId | null>(null);
  const [topView, setTopView] = useState<TopView>("garden");

  const all = useMemo(() => goals.data ?? [], [goals.data]);
  const { active, blooming } = useMemo(() => splitByBloom(all), [all]);
  const isEmpty = all.length === 0;
  const hasActive = active.length > 0;
  const hasBlooming = blooming.length > 0;
  const openGoal = openGoalId ? (all.find((g) => g.id === openGoalId) ?? null) : null;

  if (goals.isPending || garden.isPending) {
    return (
      <section className="flex min-h-full items-center justify-center px-6 py-16">
        <Spinner size="lg" className="text-brand-muted" />
      </section>
    );
  }

  function startPlanting(goalId: string) {
    setOpenGoalId(null);
    setPlacingDeco(null);
    setPlacingGoalId(goalId);
  }

  function startPlacingDeco(itemId: DecoId) {
    setPlacingGoalId(null);
    setPlacingDeco(itemId);
  }

  function cancelPlacing() {
    setPlacingGoalId(null);
    setPlacingDeco(null);
  }

  async function handleTileTap(col: number, row: number, kind: "plant" | "deco" | "empty") {
    if (kind === "plant" && placingGoalId) {
      try {
        await plantOnTile.mutateAsync({ col, row, goalId: placingGoalId });
        setPlacingGoalId(null);
      } catch {
        // The garden cache stays consistent because the mutation only writes
        // on success; surface the error visually via the disabled state.
      }
      return;
    }
    if (kind === "deco" && placingDeco) {
      try {
        await placeDeco.mutateAsync({ col, row, itemId: placingDeco });
        setPlacingDeco(null);
      } catch {
        // Same rationale as planting — the mutation is the source of truth.
      }
      return;
    }
    if (kind === "empty") setPickerOpen(true);
  }

  return (
    <section className="flex flex-col gap-3 px-5 pt-5 pb-10">
      {garden.data && (
        <div className="relative">
          {topView === "garden" ? (
            <GardenCard
              goals={all}
              garden={garden.data}
              placingGoalId={placingGoalId}
              placingDeco={placingDeco}
              onTilePlantClick={(goalId) => setOpenGoalId(goalId)}
              onTileTap={handleTileTap}
              selectedGoalId={openGoalId}
              onCancelPlacing={placingGoalId || placingDeco ? cancelPlacing : undefined}
              onTrophiesClick={() => setTrophiesOpen(true)}
              onShopClick={() => setShopOpen(true)}
            />
          ) : (
            user && <WheelCard values={user.wheelOfLife} slots={slots} />
          )}

          <TopViewSwitcher
            view={topView}
            otherLabel={topView === "garden" ? "Wheel of life" : "My Garden"}
            onToggle={() => setTopView(topView === "garden" ? "wheel" : "garden")}
          />
        </div>
      )}

      <PageHeader
        title="Life Goals"
        description="Each goal grows a plant in your garden"
        className="mt-2"
        actions={
          <Button
            size="sm"
            onClick={() => setEditorOpen(true)}
            leadingIcon={<Plus size={14} aria-hidden />}
          >
            New
          </Button>
        }
      />

      {isEmpty && <EmptyState onCreate={() => setEditorOpen(true)} />}

      {hasActive && (
        <ul className="mt-2 flex flex-col gap-3" aria-label="Active goals">
          {active.map((goal) => (
            <li key={goal.id}>
              <GoalCard goal={goal} onClick={() => setOpenGoalId(goal.id)} />
            </li>
          ))}
        </ul>
      )}

      {hasBlooming && (
        <section className="mt-4">
          <h2 className="text-brand-muted mb-2 text-[11px] font-bold tracking-wide uppercase">
            Blooming &amp; Completed
          </h2>
          <ul className="flex flex-col gap-3">
            {blooming.map((goal) => (
              <li key={goal.id}>
                <GoalCard goal={goal} onClick={() => setOpenGoalId(goal.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <GoalEditor
        mode="create"
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSubmit={async (input) => {
          await createGoal.mutateAsync(input);
        }}
      />

      <PlantNowSheet
        open={pickerOpen}
        goals={all}
        onClose={() => setPickerOpen(false)}
        onPick={(goalId) => {
          setPickerOpen(false);
          startPlanting(goalId);
        }}
      />

      {garden.data && (
        <TrophiesSheet
          open={trophiesOpen}
          goals={all}
          garden={garden.data}
          onClose={() => setTrophiesOpen(false)}
        />
      )}

      {garden.data && (
        <DecoShopSheet
          open={shopOpen}
          garden={garden.data}
          onClose={() => setShopOpen(false)}
          onPickToPlace={startPlacingDeco}
        />
      )}

      {openGoal && (
        <GoalDetailSheet
          open={openGoalId !== null}
          goal={openGoal}
          onClose={() => setOpenGoalId(null)}
          onPlantNow={startPlanting}
        >
          <TasksEditor goalId={openGoal.id} area={openGoal.area} tasks={openGoal.tasks} />
          <RoutinesEditor goalId={openGoal.id} area={openGoal.area} routines={openGoal.routines} />
        </GoalDetailSheet>
      )}
    </section>
  );
}

/**
 * Side-by-side toggle that flips the top card between the isometric garden
 * and the wheel-of-life radar. Two views means prev/next collapse to the
 * same action — we keep both buttons so the affordance reads as a carousel
 * regardless of which view is active.
 */
function TopViewSwitcher({
  view,
  otherLabel,
  onToggle,
}: {
  view: TopView;
  otherLabel: string;
  onToggle: () => void;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-1"
      aria-hidden={false}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Show ${otherLabel}`}
        className="bg-surface-card text-brand-700 hover:bg-surface-muted border-surface-muted pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] shadow-sm"
      >
        <ChevronLeft size={16} aria-hidden />
      </button>
      <span className="sr-only" aria-live="polite">
        Showing {view === "garden" ? "My Garden" : "Wheel of life"}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Show ${otherLabel}`}
        className="bg-surface-card text-brand-700 hover:bg-surface-muted border-surface-muted pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] shadow-sm"
      >
        <ChevronRight size={16} aria-hidden />
      </button>
    </div>
  );
}

function splitByBloom(goals: GoalDto[]): { active: GoalDto[]; blooming: GoalDto[] } {
  const active: GoalDto[] = [];
  const blooming: GoalDto[] = [];
  for (const g of goals) {
    if (g.completed || (g.planted && g.stage >= 4)) blooming.push(g);
    else active.push(g);
  }
  return { active, blooming };
}
