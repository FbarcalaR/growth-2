"use client";

import { useState } from "react";

import {
  AreaChip,
  AreaPicker,
  HealthBadge,
  ResourceMeter,
  RoutineRow,
  TaskRow,
} from "@/components/molecules";
import { AREA_KEYS } from "@/shared/areas";
import { HEALTH_STATES } from "@/shared/health";

import { Section } from "../_components";

export function MoleculesSection() {
  const [taskOneDone, setTaskOneDone] = useState(false);
  const [taskTwoDone, setTaskTwoDone] = useState(true);
  const [routineDone, setRoutineDone] = useState(false);
  const [pickedArea, setPickedArea] = useState<(typeof AREA_KEYS)[number] | null>("health");

  return (
    <div className="space-y-12">
      <Section title="Area chips">
        <div className="bg-surface-card border-surface-muted flex flex-wrap gap-2 rounded-md border p-5">
          {AREA_KEYS.map((area) => (
            <AreaChip key={area} area={area} />
          ))}
        </div>
      </Section>

      <Section title="Health badges">
        <div className="bg-surface-card border-surface-muted flex flex-wrap gap-2 rounded-md border p-5">
          {HEALTH_STATES.map((state) => (
            <HealthBadge key={state} state={state} />
          ))}
        </div>
      </Section>

      <Section title="Resource meters">
        <div className="bg-surface-card border-surface-muted grid max-w-md gap-3 rounded-md border p-5">
          <ResourceMeter resource="water" current={3} required={8} />
          <ResourceMeter resource="sunlight" current={6} required={8} />
          <ResourceMeter resource="love" current={8} required={8} />
        </div>
      </Section>

      <Section title="Task rows">
        <div className="grid max-w-md gap-2">
          <TaskRow
            title="Run 3x per week"
            completed={taskOneDone}
            onToggle={setTaskOneDone}
            area="health"
            dueLabel="Today"
          />
          <TaskRow
            title="Cancel unused subscriptions"
            completed={taskTwoDone}
            onToggle={setTaskTwoDone}
            area="finances"
            dueLabel="2 days overdue"
            overdue
          />
        </div>
      </Section>

      <Section title="Routine rows">
        <div className="grid max-w-md gap-2">
          <RoutineRow
            title="Morning stretch"
            completedToday={routineDone}
            onToggle={setRoutineDone}
            streak={5}
            area="health"
          />
          <RoutineRow
            title="Read industry news"
            completedToday={false}
            onToggle={() => undefined}
            streak={0}
            area="career"
          />
        </div>
      </Section>

      <Section title="Area picker">
        <div className="bg-surface-card border-surface-muted max-w-md rounded-md border p-5">
          <AreaPicker value={pickedArea} onChange={setPickedArea} />
          <p className="text-brand-muted mt-3 text-xs">
            Selected: <span className="text-brand-700 font-semibold">{pickedArea ?? "none"}</span>
          </p>
        </div>
      </Section>
    </div>
  );
}
