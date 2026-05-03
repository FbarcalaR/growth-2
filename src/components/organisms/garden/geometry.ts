/**
 * Garden geometry — ported verbatim from `garden-tab.jsx` lines 18-49.
 *
 * Two coordinate systems live on the same SVG:
 *
 *   • SCENE — outer 14×11 grid of `TILE`-sized tiles (336×264 viewport).
 *     Holds the background painting (grass / path / water / scenery
 *     decorations).
 *
 *   • PLOT — inner 8×6 grid of `PLOT_TILE`-sized tiles, offset from the
 *     scene origin by `(PLOT_OX, PLOT_OY)` scene-tiles. Top 4 rows are the
 *     *grass zone* (decorations only); bottom 2 rows are the *tilled zone*
 *     (seeds only). The split lives in `PLANT_ROW_START`.
 */

export const TILE = 24;
export const PLOT_TILE = 28;

export const GARDEN_COLS = 8;
export const GARDEN_ROWS = 6;

/** Bottom rows ≥ this index are tilled soil (planting zone). */
export const PLANT_ROW_START = 4;
export const isPlantingRow = (row: number) => row >= PLANT_ROW_START;
export const isGrassRow = (row: number) => row < PLANT_ROW_START;

export const SCENE_COLS = 14;
export const SCENE_ROWS = 11;
export const SVG_W = SCENE_COLS * TILE; // 336
export const SVG_H = SCENE_ROWS * TILE; // 264

export const PLOT_OX = 2;
export const PLOT_OY = 2.6;
export const PLOT_W = GARDEN_COLS * PLOT_TILE;
export const PLOT_H = GARDEN_ROWS * PLOT_TILE;
export const PLOT_PX = PLOT_OX * TILE;
export const PLOT_PY = PLOT_OY * TILE;

export function plotTileXY(col: number, row: number) {
  return { x: PLOT_PX + col * PLOT_TILE, y: PLOT_PY + row * PLOT_TILE };
}

export function plotTileCenter(col: number, row: number) {
  const { x, y } = plotTileXY(col, row);
  return { cx: x + PLOT_TILE / 2, cy: y + PLOT_TILE / 2 };
}
