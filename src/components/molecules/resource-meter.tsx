import { ProgressBar } from "@/components/atoms";
import { RESOURCE_META, type Resource } from "@/shared/resources";

type ResourceMeterProps = {
  resource: Resource;
  current: number;
  required: number;
};

export function ResourceMeter({ resource, current, required }: ResourceMeterProps) {
  const meta = RESOURCE_META[resource];
  const safeRequired = Math.max(1, required);
  const ratio = current / safeRequired;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span
          className="inline-flex items-center gap-1"
          style={{ color: `var(--color-res-${resource})` }}
        >
          <span aria-hidden>{meta.icon}</span>
          {meta.label}
        </span>
        <span className="text-brand-muted tabular-nums">
          {Math.min(current, required)} / {required}
        </span>
      </div>
      <ProgressBar
        value={ratio}
        label={`${meta.label} progress`}
        accent={`var(--color-res-${resource})`}
      />
    </div>
  );
}
