import { PlantSprite } from "@/components/atoms";
import type { Area } from "@/shared/areas";
import type { PlantId, Stage } from "@/shared/plants";
import type { HealthState } from "@/shared/health";

type GoalIconProps = {
  area: Area;
  plantType: PlantId;
  stage: Stage;
  healthState: HealthState;
  /** True when the goal hasn't been planted yet — renders a seed envelope instead of the plant. */
  isSeed?: boolean;
  /** Sprite size in px. Container scales to fit. Defaults to 52. */
  size?: number;
};

/**
 * Goal avatar: either a `<PlantSprite>` (planted goals) or a small seed-packet
 * SVG (unplanted goals). Used in goal cards and detail headers.
 */
export function GoalIcon({
  area,
  plantType,
  stage,
  healthState,
  isSeed = false,
  size = 52,
}: GoalIconProps) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden
      data-area={area}
    >
      {isSeed ? (
        <SeedPacket size={size} />
      ) : (
        <PlantSprite plantId={plantType} stage={stage} healthState={healthState} size={size} />
      )}
    </span>
  );
}

function SeedPacket({ size }: { size: number }) {
  // Proportions match the prototype's hand-drawn seed envelope. Rendering
  // inline because the shape is purely decorative.
  const w = size * 0.85;
  const h = size * 0.96;
  return (
    <svg width={w} height={h} viewBox="0 0 52 60">
      <rect x="6" y="8" width="40" height="44" rx="4" fill="#FFF8E1" />
      <rect
        x="6"
        y="8"
        width="40"
        height="44"
        rx="4"
        fill="none"
        stroke="#F9A825"
        strokeWidth="1.5"
      />
      <rect x="6" y="8" width="40" height="10" rx="4" fill="#F9A825" />
      <rect x="6" y="14" width="40" height="4" fill="#F9A825" />
      <ellipse cx="26" cy="35" rx="9" ry="11" fill="#A5D6A7" />
      <ellipse cx="26" cy="33" rx="6" ry="7" fill="#81C784" />
      <ellipse cx="21" cy="30" rx="3" ry="4" fill="white" opacity="0.25" />
    </svg>
  );
}
