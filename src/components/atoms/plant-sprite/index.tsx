import type { CSSProperties } from "react";

import type { HealthState } from "@/shared/health";
import type { PlantId, Stage } from "@/shared/plants";

import { DeadPlant } from "./dead-plant";
import { renderCrystal } from "./variants/crystal";
import { renderHerb } from "./variants/herb";
import { renderMoneyTree } from "./variants/money-tree";
import { renderMoonFlower } from "./variants/moon-flower";
import { renderMushroom } from "./variants/mushroom";
import { renderRose } from "./variants/rose";
import { renderSunflower } from "./variants/sunflower";

type PlantSpriteProps = {
  plantId: PlantId;
  stage: Stage;
  /** Side length in px. Defaults to 64. */
  size?: number;
  /** Tints the sprite to reflect plant health. Defaults to "healthy". */
  healthState?: HealthState;
  className?: string;
};

const VARIANTS: Record<
  PlantId,
  (props: { stage: Stage; cx: number; by: number; h: number }) => React.ReactNode
> = {
  herb: renderHerb,
  sunflower: renderSunflower,
  rose: renderRose,
  mushroom: renderMushroom,
  money_tree: renderMoneyTree,
  crystal: renderCrystal,
  moon_flower: renderMoonFlower,
};

const HEALTH_FILTERS: Record<HealthState, CSSProperties | undefined> = {
  healthy: undefined,
  wilting: { filter: "saturate(0.65) hue-rotate(-8deg) brightness(0.96)" },
  ill: { filter: "saturate(0.45) sepia(0.25) brightness(0.92)" },
  critical: { filter: "saturate(0.25) sepia(0.45) brightness(0.85)", opacity: 0.92 },
  dead: { filter: "grayscale(0.85) brightness(0.7) contrast(0.95)", opacity: 0.85 },
};

/**
 * SVG plant illustration. One of seven plant variants × five stages
 * (0 = seed, 4 = blooming) overlaid on a shared pot, plus a withered-stem
 * fallback when `healthState === "dead"`. Per-variant artwork lives in
 * `./variants/` so each file owns one plant.
 */
export function PlantSprite({
  plantId,
  stage,
  size = 64,
  healthState = "healthy",
  className,
}: PlantSpriteProps) {
  const w = size;
  const h = size;
  const cx = w / 2;
  const potY = h * 0.65;
  const potH = h * 0.28;
  const potW = w * 0.4;
  const rimPts = `${cx - potW * 0.55},${potY} ${cx + potW * 0.55},${potY} ${cx + potW * 0.5},${potY + potH * 0.25} ${cx - potW * 0.5},${potY + potH * 0.25}`;
  const potPts = `${cx - potW * 0.5},${potY + potH * 0.22} ${cx + potW * 0.5},${potY + potH * 0.22} ${cx + potW * 0.4},${potY + potH} ${cx - potW * 0.4},${potY + potH}`;
  const by = potY;

  const renderVariant = VARIANTS[plantId] ?? renderHerb;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`${plantId} stage ${stage}`}
      data-plant-id={plantId}
      data-stage={stage}
      data-health-state={healthState}
      style={HEALTH_FILTERS[healthState]}
      className={className}
    >
      <polygon points={rimPts} fill="#BCAAA4" />
      <polygon points={potPts} fill="#A1887F" />
      <ellipse cx={cx} cy={potY + potH} rx={potW * 0.4} ry={3} fill="rgba(0,0,0,0.07)" />
      <ellipse cx={cx} cy={potY} rx={potW * 0.47} ry={potW * 0.17} fill="#5D4037" />
      {healthState === "dead" ? (
        <DeadPlant cx={cx} by={by} h={h} size={size} />
      ) : (
        renderVariant({ stage, cx, by, h })
      )}
      {healthState === "wilting" && (
        <text x={cx + w * 0.32} y={by - h * 0.2} fontSize={size * 0.18} opacity="0.85">
          💧
        </text>
      )}
      {healthState === "ill" && (
        <text x={cx + w * 0.32} y={by - h * 0.18} fontSize={size * 0.2} opacity="0.9">
          🥀
        </text>
      )}
      {healthState === "critical" && (
        <text x={cx + w * 0.3} y={by - h * 0.2} fontSize={size * 0.22} opacity="0.95">
          ⚠️
        </text>
      )}
    </svg>
  );
}
