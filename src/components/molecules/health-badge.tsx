import { Badge } from "@/components/atoms";
import { HEALTH_META, type HealthState } from "@/shared/health";

type HealthBadgeProps = {
  state: HealthState;
  /** When false, hides the icon and just shows the label. Defaults to true. */
  showIcon?: boolean;
  className?: string;
};

export function HealthBadge({ state, showIcon = true, className }: HealthBadgeProps) {
  const meta = HEALTH_META[state];
  return (
    <Badge tone={state} className={className} aria-label={`Plant is ${meta.label}`}>
      {showIcon && <span aria-hidden>{meta.icon}</span>}
      <span>{meta.label}</span>
    </Badge>
  );
}
