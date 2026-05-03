// Top-down per-plant per-stage sprite. Used inside `<IsometricGarden>` for tiles in the planting zone.

import type { CSSProperties } from "react";

import type { HealthState } from "@/shared/health";
import type { PlantId, Stage } from "@/shared/plants";

import { PLOT_TILE } from "./geometry";

type TilePlantProps = {
  plantId: PlantId;
  stage: Stage;
  cx: number;
  cy: number;
  onClick?: () => void;
  isSelected?: boolean;
  healthState?: HealthState;
};

function tintFor(healthState: HealthState): CSSProperties | undefined {
  switch (healthState) {
    case "wilting":
      return { filter: "saturate(0.65) hue-rotate(-8deg)" };
    case "ill":
      return { filter: "saturate(0.4) sepia(0.3) brightness(0.92)" };
    case "critical":
      return { filter: "saturate(0.2) sepia(0.5) brightness(0.85)", opacity: 0.9 };
    case "dead":
      return { filter: "grayscale(0.85) brightness(0.7)", opacity: 0.85 };
    default:
      return undefined;
  }
}

export function TilePlant({
  plantId,
  stage,
  cx,
  cy,
  onClick,
  isSelected,
  healthState = "healthy",
}: TilePlantProps) {
  // Plant occupies the tile centered on (cx, cy). ~24px sprite area.
  const x = cx - 12;
  const y = cy - 14; // top-left of 24×24-ish sprite
  const isDead = healthState === "dead";
  const tint = tintFor(healthState);

  function sprite() {
    if (stage === 0) {
      // seed in dirt
      return (
        <g shapeRendering="crispEdges">
          <rect x={x + 10} y={y + 18} width={4} height={3} fill="#4F8E2D" />
          <rect x={x + 11} y={y + 15} width={2} height={4} fill="#3A6B22" />
        </g>
      );
    }
    if (stage === 1) {
      // sprout — small green plant for everyone
      return (
        <g shapeRendering="crispEdges">
          <rect x={x + 11} y={y + 12} width={2} height={9} fill="#3A8B36" />
          <rect x={x + 8} y={y + 12} width={3} height={2} fill="#4FA64A" />
          <rect x={x + 13} y={y + 10} width={3} height={2} fill="#5FB75A" />
          <rect x={x + 10} y={y + 8} width={4} height={3} fill="#5FB75A" />
        </g>
      );
    }

    // stages 2, 3, 4 — variant per plant
    const fullBloom = stage === 4;
    const big = stage >= 3;

    const fruit = (color: string, accent: string = "#fff") => (
      <>
        <rect x={x + 9} y={y + 6} width={3} height={3} fill={color} />
        <rect x={x + 13} y={y + 5} width={3} height={3} fill={color} />
        <rect x={x + 11} y={y + 9} width={3} height={3} fill={color} />
        <rect x={x + 9} y={y + 6} width={1} height={1} fill={accent} opacity="0.9" />
        <rect x={x + 13} y={y + 5} width={1} height={1} fill={accent} opacity="0.9" />
      </>
    );

    // base bushy leaves
    const leaves = (
      <g shapeRendering="crispEdges">
        <rect x={x + 11} y={y + 13} width={2} height={9} fill="#3A6B22" />
        <rect x={x + 6} y={y + 12} width={4} height={3} fill="#3A8B36" />
        <rect x={x + 14} y={y + 11} width={4} height={3} fill="#3A8B36" />
        <rect x={x + 6} y={y + 15} width={12} height={4} fill="#4FA64A" />
        <rect x={x + 8} y={y + 11} width={8} height={5} fill="#5FB75A" />
        <rect x={x + 9} y={y + 9} width={6} height={3} fill="#5FB75A" />
        <rect x={x + 10} y={y + 11} width={2} height={1} fill="#85D578" opacity="0.9" />
        {big && <rect x={x + 5} y={y + 18} width={14} height={2} fill="#3A6B22" />}
      </g>
    );

    switch (plantId) {
      case "sunflower":
        return (
          <g shapeRendering="crispEdges">
            <rect x={x + 11} y={y + 8} width={2} height={14} fill="#3A6B22" />
            <rect x={x + 8} y={y + 14} width={3} height={2} fill="#3A8B36" />
            <rect x={x + 13} y={y + 12} width={3} height={2} fill="#3A8B36" />
            {/* head */}
            {big ? (
              <g>
                <rect x={x + 7} y={y + 3} width={10} height={8} fill="#FFC940" />
                <rect x={x + 5} y={y + 5} width={2} height={4} fill="#F2A91D" />
                <rect x={x + 17} y={y + 5} width={2} height={4} fill="#F2A91D" />
                <rect x={x + 9} y={y + 5} width={6} height={4} fill="#7B4A1F" />
                <rect x={x + 10} y={y + 6} width={2} height={1} fill="#5B3A21" />
                {fullBloom && <rect x={x + 9} y={y + 1} width={2} height={2} fill="#FFE07A" />}
              </g>
            ) : (
              <rect x={x + 9} y={y + 6} width={6} height={5} fill="#FFC940" />
            )}
          </g>
        );
      case "rose":
        return (
          <g shapeRendering="crispEdges">
            {leaves}
            {fruit(fullBloom ? "#E2333D" : "#B82D34", "#FFC0C5")}
          </g>
        );
      case "herb":
        return (
          <g shapeRendering="crispEdges">
            {leaves}
            {fullBloom && (
              <>
                <rect x={x + 9} y={y + 5} width={2} height={2} fill="#FFE07A" />
                <rect x={x + 13} y={y + 5} width={2} height={2} fill="#FFE07A" />
                <rect x={x + 11} y={y + 3} width={2} height={2} fill="#FFE07A" />
              </>
            )}
          </g>
        );
      case "mushroom":
        return (
          <g shapeRendering="crispEdges">
            <rect x={x + 10} y={y + 13} width={4} height={8} fill="#E8DCC4" />
            <rect x={x + 10} y={y + 13} width={1} height={8} fill="#B8A88B" />
            <rect x={x + 6} y={y + 8} width={12} height={5} fill="#D7363B" />
            <rect x={x + 5} y={y + 10} width={1} height={3} fill="#A02129" />
            <rect x={x + 18} y={y + 10} width={1} height={3} fill="#A02129" />
            <rect x={x + 8} y={y + 9} width={2} height={2} fill="#FFFFFF" />
            <rect x={x + 13} y={y + 10} width={2} height={2} fill="#FFFFFF" />
            {big && <rect x={x + 10} y={y + 5} width={4} height={3} fill="#D7363B" />}
          </g>
        );
      case "money_tree":
        return (
          <g shapeRendering="crispEdges">
            <rect x={x + 11} y={y + 14} width={2} height={8} fill="#5B3A21" />
            <rect x={x + 5} y={y + 8} width={14} height={8} fill="#3A8B36" />
            <rect x={x + 7} y={y + 5} width={10} height={4} fill="#4FA64A" />
            <rect x={x + 9} y={y + 3} width={6} height={3} fill="#5FB75A" />
            {big && (
              <>
                <rect x={x + 8} y={y + 9} width={2} height={2} fill="#FFD24D" />
                <rect x={x + 14} y={y + 10} width={2} height={2} fill="#FFD24D" />
                <rect x={x + 11} y={y + 6} width={2} height={2} fill="#FFD24D" />
              </>
            )}
          </g>
        );
      case "crystal":
        return (
          <g shapeRendering="crispEdges">
            <rect x={x + 9} y={y + 10} width={6} height={11} fill="#B07DD4" />
            <rect x={x + 9} y={y + 10} width={2} height={11} fill="#7B4FA1" />
            <rect x={x + 10} y={y + 6} width={4} height={5} fill="#D8A8F0" />
            <rect x={x + 11} y={y + 3} width={2} height={4} fill="#E8C4FF" />
            <rect x={x + 10} y={y + 7} width={1} height={1} fill="#FFFFFF" opacity="0.9" />
            {big && (
              <>
                <rect x={x + 5} y={y + 13} width={4} height={6} fill="#9F6BD9" />
                <rect x={x + 15} y={y + 12} width={4} height={7} fill="#9F6BD9" />
                <rect x={x + 15} y={y + 12} width={1} height={7} fill="#7B4FA1" />
              </>
            )}
          </g>
        );
      case "moon_flower":
        return (
          <g shapeRendering="crispEdges">
            <rect x={x + 11} y={y + 10} width={2} height={12} fill="#3A6B22" />
            <rect x={x + 8} y={y + 15} width={3} height={2} fill="#3A8B36" />
            <rect x={x + 13} y={y + 13} width={3} height={2} fill="#3A8B36" />
            {/* white-blue petals */}
            <rect x={x + 9} y={y + 5} width={6} height={6} fill="#DCE6FF" />
            <rect x={x + 8} y={y + 7} width={2} height={3} fill="#B8C8F0" />
            <rect x={x + 14} y={y + 7} width={2} height={3} fill="#B8C8F0" />
            <rect x={x + 11} y={y + 7} width={2} height={2} fill="#FFFDC2" />
            {fullBloom && <rect x={x + 10} y={y + 3} width={4} height={2} fill="#DCE6FF" />}
          </g>
        );
      default:
        return (
          <g shapeRendering="crispEdges">
            {leaves}
            {fruit("#FFC940")}
          </g>
        );
    }
  }

  const rootProps = onClick ? { onClick, style: { cursor: "pointer" as const } } : {};

  return (
    <g {...rootProps}>
      {/* selection ring around tile */}
      {isSelected && (
        <rect
          x={cx - PLOT_TILE / 2 + 1}
          y={cy - PLOT_TILE / 2 + 1}
          width={PLOT_TILE - 2}
          height={PLOT_TILE - 2}
          fill="rgba(255,220,80,0.18)"
          stroke="#FFD24D"
          strokeWidth="1.5"
          strokeDasharray="3,2"
          shapeRendering="crispEdges"
        />
      )}
      {/* tile-bottom shadow under plant */}
      <ellipse cx={cx} cy={cy + 9} rx="7" ry="2" fill="rgba(0,0,0,0.22)" />
      {isDead ? (
        // Dead — render withered stump regardless of plantId
        <g shapeRendering="crispEdges" style={tint}>
          <rect x={x + 10} y={y + 15} width={4} height={6} fill="#6B4F2F" />
          <rect x={x + 10} y={y + 15} width={1} height={6} fill="#3F2715" />
          <rect x={x + 8} y={y + 13} width={3} height={2} fill="#8B6F47" />
          <rect x={x + 13} y={y + 11} width={2} height={2} fill="#8B6F47" />
          {/* drooping dried leaf */}
          <rect x={x + 6} y={y + 18} width={3} height={1} fill="#A88752" />
          <rect x={x + 15} y={y + 19} width={3} height={1} fill="#A88752" />
        </g>
      ) : (
        <g style={tint}>{sprite()}</g>
      )}
      {/* Health indicator badge above plant */}
      {!isDead && healthState === "wilting" && (
        <text x={cx + 8} y={y + 4} fontSize="10" textAnchor="middle">
          💧
        </text>
      )}
      {!isDead && healthState === "ill" && (
        <text x={cx + 8} y={y + 4} fontSize="11" textAnchor="middle">
          🥀
        </text>
      )}
      {!isDead && healthState === "critical" && (
        <text x={cx + 8} y={y + 4} fontSize="12" textAnchor="middle">
          ⚠️
        </text>
      )}
      {isDead && (
        <text x={cx + 8} y={y + 4} fontSize="12" textAnchor="middle">
          💀
        </text>
      )}
    </g>
  );
}
