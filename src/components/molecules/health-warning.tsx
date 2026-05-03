import { HEALTH_META, type HealthState } from "@/shared/health";

type HealthWarningProps = {
  state: HealthState;
  /** How many of the goal's tasks are currently past their due date. */
  overdueCount: number;
  className?: string;
};

/**
 * Tailwind needs static class strings, so we look them up by state instead
 * of templating. Mirrors the `Badge` atom's `TONE_CLASSES` map.
 */
const TONE_CLASSES: Record<HealthState, string> = {
  healthy: "bg-health-healthy-bg text-health-healthy border-health-healthy/25",
  wilting: "bg-health-wilting-bg text-health-wilting border-health-wilting/25",
  ill: "bg-health-ill-bg text-health-ill border-health-ill/25",
  critical: "bg-health-critical-bg text-health-critical border-health-critical/25",
  dead: "bg-health-dead-bg text-health-dead border-health-dead/25",
};

/**
 * Inline warning band shown when a goal's plant is wilting / ill / critical.
 * Renders nothing for `healthy` and `dead` (those states have their own
 * surfaces — the dead-plant banner / panel). Mirrors the prototype's
 * `Health warning — when wilting/ill/critical, replaces growth subtitle`
 * block in `plans-tab.jsx`.
 *
 * Used on `<GoalCard>` bodies (Garden tab) and the Today `<GoalGroup>` header.
 */
export function HealthWarning({ state, overdueCount, className }: HealthWarningProps) {
  if (state === "healthy" || state === "dead") return null;

  const meta = HEALTH_META[state];

  return (
    <div
      role="status"
      aria-label={`${meta.label}: ${meta.copy}`}
      className={`flex items-center gap-2 rounded-[10px] border px-2.5 py-1.5 text-[11px] font-semibold ${TONE_CLASSES[state]} ${className ?? ""}`}
    >
      <span aria-hidden className="text-[13px]">
        {meta.icon}
      </span>
      <span className="flex-1 leading-tight">
        {overdueCount > 0 && <strong className="font-bold">{overdueCount} overdue · </strong>}
        {meta.copy}
      </span>
    </div>
  );
}
