"use client";

import { useState } from "react";

import type { GardenDto, GardenTileDto } from "@/shared/schemas/garden";
import type { GoalDto } from "@/shared/schemas/goal";
import { type Stage } from "@/shared/plants";

import { DecoSprite, type DecoId } from "./deco-sprite";
import {
  GARDEN_COLS,
  GARDEN_ROWS,
  PLANT_ROW_START,
  PLOT_PX,
  PLOT_PY,
  PLOT_TILE,
  PLOT_W,
  SVG_H,
  SVG_W,
  isGrassRow,
  plotTileCenter,
  plotTileXY,
} from "./geometry";
import { GrassSoil, HoverGrass, TilledSoil, WetSoil } from "./ground-tile";
import { FarmScenery } from "./scenery";
import { TilePlant } from "./tile-plant";

type IsometricGardenProps = {
  goals: GoalDto[];
  garden: GardenDto;
  /** When set, the user is choosing a tile to plant this goal on. */
  placingGoalId?: string | null;
  /** When set, the user is choosing a tile to place this deco on. */
  placingDeco?: DecoId | null;
  /** Tap on a planted tile (the goal's plant). */
  onTilePlantClick?: (goalId: string) => void;
  /** Tap on an empty / non-plant tile. `kind` reflects what the tap means
   *  given the placing-state and the tile's zone. */
  onTileTap?: (col: number, row: number, kind: "plant" | "deco" | "empty") => void;
  /** Highlight the plant for this goal id (e.g. when the detail-sheet is open). */
  selectedGoalId?: string | null;
};

/**
 * Top-down isometric garden ported from the prototype's `IsometricGarden`.
 * Renders the scenery layer, the inner 8×6 plot (grass deco zone on top, tilled
 * planting zone on bottom), the planted goals, and any placed decorations.
 *
 * Hover on a tile shows a "valid placement" highlight (yellow dashes when
 * compatible with the current placing state, red when not) — matches the
 * prototype's affordance.
 */
export function IsometricGarden({
  goals,
  garden,
  placingGoalId = null,
  placingDeco = null,
  onTilePlantClick,
  onTileTap,
  selectedGoalId = null,
}: IsometricGardenProps) {
  const [hov, setHov] = useState<string | null>(null);
  const placing = Boolean(placingGoalId || placingDeco);

  // Build a (col,row) → planted goal lookup so the plant layer can render
  // top-down with proper overlap.
  const plantedGoals = goals.filter((g) => g.planted && g.tileCol !== null && g.tileRow !== null);
  const plantMap = new Map<string, GoalDto>();
  for (const g of plantedGoals) {
    plantMap.set(`${g.tileCol}-${g.tileRow}`, g);
  }

  // Sort tiles row-then-column so plants in lower rows can overlap upper ones.
  const tiles: { col: number; row: number }[] = [];
  for (let c = 0; c < GARDEN_COLS; c += 1) {
    for (let r = 0; r < GARDEN_ROWS; r += 1) tiles.push({ col: c, row: r });
  }
  tiles.sort((a, b) => a.row - b.row || a.col - b.col);

  const tileAt = (col: number, row: number): GardenTileDto => garden.decoGrid[col]?.[row] ?? null;

  return (
    <svg
      width={SVG_W}
      height={SVG_H}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="block w-full"
      style={{ imageRendering: "pixelated" }}
    >
      <FarmScenery />

      {tiles.map(({ col, row }) => {
        const { x, y } = plotTileXY(col, row);
        const key = `${col}-${row}`;
        const tile = tileAt(col, row);
        const plantGoal = tile?.kind === "plant" ? (plantMap.get(key) ?? null) : null;
        const isFree = tile === null;
        const isHover = hov === key;
        const grass = isGrassRow(row);
        const compatible = placingGoalId ? !grass : placingDeco ? grass : true;
        const showInvalidHover = isHover && placing && (!isFree || !compatible);
        const showValidHover = isHover && isFree && compatible;
        const cursor = plantGoal || (isFree && (!placing || compatible)) ? "pointer" : "default";

        function handleClick() {
          if (plantGoal) {
            onTilePlantClick?.(plantGoal.id);
            return;
          }
          if (placingGoalId && isFree && !grass) {
            onTileTap?.(col, row, "plant");
            return;
          }
          if (placingDeco && isFree && grass) {
            onTileTap?.(col, row, "deco");
            return;
          }
          if (isFree && !placing) onTileTap?.(col, row, "empty");
        }

        return (
          <g
            key={key}
            onMouseEnter={() => setHov(key)}
            onMouseLeave={() => setHov(null)}
            onClick={handleClick}
            style={{ cursor }}
          >
            {grass ? (
              isHover && isFree ? (
                <HoverGrass x={x} y={y} />
              ) : (
                <GrassSoil x={x} y={y} col={col} row={row} />
              )
            ) : isHover && isFree ? (
              <WetSoil x={x} y={y} />
            ) : (
              <TilledSoil x={x} y={y} />
            )}
            {/* Hit target — sub-rect speckles inside the soil tiles set
                pointerEvents:none, so we need a real catch-all per tile. */}
            <rect
              x={x}
              y={y}
              width={PLOT_TILE}
              height={PLOT_TILE}
              fill="transparent"
              style={{ pointerEvents: "all" }}
            />
            {showValidHover && (
              <rect
                x={x + 1}
                y={y + 1}
                width={PLOT_TILE - 2}
                height={PLOT_TILE - 2}
                fill="none"
                stroke={placing ? "#FFD24D" : "#FFFFFF"}
                strokeWidth="1.5"
                strokeDasharray="3,2"
                shapeRendering="crispEdges"
              />
            )}
            {showInvalidHover && (
              <rect
                x={x + 1}
                y={y + 1}
                width={PLOT_TILE - 2}
                height={PLOT_TILE - 2}
                fill="rgba(216,57,57,0.18)"
                stroke="#D83939"
                strokeWidth="1.5"
                strokeDasharray="3,2"
                shapeRendering="crispEdges"
              />
            )}
          </g>
        );
      })}

      {/* Subtle divider between the deco (grass) zone and the planting zone. */}
      <line
        x1={PLOT_PX}
        y1={PLOT_PY + PLANT_ROW_START * PLOT_TILE}
        x2={PLOT_PX + PLOT_W}
        y2={PLOT_PY + PLANT_ROW_START * PLOT_TILE}
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="1"
        shapeRendering="crispEdges"
        style={{ pointerEvents: "none" }}
      />

      {/* Decorations layer (sorted by row for proper overlap). */}
      {tiles
        .map(({ col, row }) => ({ col, row, tile: tileAt(col, row) }))
        .filter((t): t is { col: number; row: number; tile: { kind: "deco"; itemId: string } } =>
          t.tile?.kind === "deco" ? true : false,
        )
        .map(({ col, row, tile }) => {
          const { cx, cy } = plotTileCenter(col, row);
          return (
            <DecoSprite key={`d-${col}-${row}`} type={tile.itemId as DecoId} cx={cx} cy={cy} />
          );
        })}

      {/* Plants layer. Sort by row so lower plants overlap upper ones. */}
      {plantedGoals
        .slice()
        .sort((a, b) => (a.tileRow ?? 0) - (b.tileRow ?? 0))
        .map((goal) => {
          if (goal.tileCol === null || goal.tileRow === null) return null;
          const { cx, cy } = plotTileCenter(goal.tileCol, goal.tileRow);
          return (
            <TilePlant
              key={`p-${goal.id}`}
              plantId={goal.plantType}
              stage={goal.stage as Stage}
              healthState={goal.healthState}
              cx={cx}
              cy={cy}
              onClick={onTilePlantClick ? () => onTilePlantClick(goal.id) : undefined}
              isSelected={selectedGoalId === goal.id}
            />
          );
        })}
    </svg>
  );
}
