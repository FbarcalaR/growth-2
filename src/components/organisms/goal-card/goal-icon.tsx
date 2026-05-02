import { PlantSprite } from "@/components/atoms";
import type { Area } from "@/shared/areas";
import type { Stage } from "@/shared/plants";
import type { GoalDto } from "@/shared/schemas/goal";

type GoalIconProps = {
  area: Area;
  plantType: GoalDto["plantType"];
  stage: Stage;
  healthState: GoalDto["healthState"];
  size?: number;
};

/** Plant sprite on an area-tinted square. Used as the goal-card avatar. */
export function GoalIcon({ area, plantType, stage, healthState, size = 48 }: GoalIconProps) {
  const containerSize = size + 8;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        background: `color-mix(in srgb, var(--color-area-${area}) 13%, transparent)`,
      }}
    >
      <PlantSprite plantId={plantType} stage={stage} healthState={healthState} size={size} />
    </span>
  );
}
