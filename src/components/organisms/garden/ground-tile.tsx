import { PLOT_TILE, TILE } from "./geometry";

/**
 * Per-scene-tile pixel-art painter ported from `garden-tab.jsx` lines 100-144.
 * One of `g | G | p | w | s` (grass / dark-grass / path / water / sand) drives
 * the palette + per-tile speckle / ripple / pebble accent. Speckles are
 * deterministic per `(x, y)` so re-renders don't re-roll them.
 */
type GroundType = "g" | "G" | "p" | "w" | "s";

const PALETTE: Record<GroundType, { base: string; dark: string; light: string }> = {
  g: { base: "#7CC457", dark: "#5FA73F", light: "#9AD46E" },
  G: { base: "#69B448", dark: "#4F9135", light: "#85C75E" },
  p: { base: "#C9A06A", dark: "#A37D4D", light: "#DDB682" },
  w: { base: "#4DA8D6", dark: "#2E7CA8", light: "#79C5E6" },
  s: { base: "#E8D08A", dark: "#C7AC6A", light: "#F2DFA6" },
};

export function GroundTile({ x, y, type }: { x: number; y: number; type: GroundType }) {
  const p = PALETTE[type] ?? PALETTE.g;
  const seed = (((x * 131 + y * 53) % 7) + 7) % 7;
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={x} y={y} width={TILE} height={TILE} fill={p.base} />
      {/* edge dither: top-left highlight, bottom-right shadow */}
      <rect x={x} y={y} width={TILE} height={2} fill={p.light} opacity="0.5" />
      <rect x={x} y={y + TILE - 2} width={TILE} height={2} fill={p.dark} opacity="0.4" />
      {/* speckles */}
      {seed === 0 && <rect x={x + 4} y={y + 6} width={2} height={2} fill={p.dark} opacity="0.7" />}
      {seed === 1 && (
        <rect x={x + 12} y={y + 10} width={2} height={2} fill={p.light} opacity="0.7" />
      )}
      {seed === 2 && <rect x={x + 18} y={y + 4} width={2} height={2} fill={p.dark} opacity="0.7" />}
      {seed === 3 && <rect x={x + 8} y={y + 16} width={2} height={2} fill={p.dark} opacity="0.6" />}
      {seed === 4 && (
        <rect x={x + 14} y={y + 18} width={2} height={2} fill={p.light} opacity="0.7" />
      )}
      {seed === 5 && (
        <rect x={x + 6} y={y + 12} width={2} height={2} fill={p.light} opacity="0.6" />
      )}
      {/* water ripples */}
      {type === "w" && (
        <g>
          <rect x={x + 4} y={y + 10} width={6} height={1} fill={p.light} opacity="0.85" />
          <rect x={x + 14} y={y + 16} width={5} height={1} fill={p.light} opacity="0.8" />
        </g>
      )}
      {/* sand pebbles */}
      {type === "s" && seed % 2 === 0 && (
        <rect x={x + 10} y={y + 12} width={3} height={2} fill={p.dark} opacity="0.7" />
      )}
    </g>
  );
}

/** Tilled soil with horizontal furrow rows. Used for the planting zone. */
export function TilledSoil({ x, y, size = PLOT_TILE }: { x: number; y: number; size?: number }) {
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={x} y={y} width={size} height={size} fill="#7A4F2C" />
      <rect x={x} y={y + 5} width={size} height={3} fill="#5C3A1F" opacity="0.55" />
      <rect x={x} y={y + 13} width={size} height={3} fill="#5C3A1F" opacity="0.55" />
      <rect x={x} y={y + 21} width={size} height={3} fill="#5C3A1F" opacity="0.55" />
      <rect x={x} y={y + 2} width={size} height={1} fill="#9C6B3F" opacity="0.75" />
      <rect x={x} y={y + 10} width={size} height={1} fill="#9C6B3F" opacity="0.75" />
      <rect x={x} y={y + 18} width={size} height={1} fill="#9C6B3F" opacity="0.75" />
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="0.5"
      />
    </g>
  );
}

/** Darker tilled soil — used for hover / selection on the planting zone. */
export function WetSoil({ x, y, size = PLOT_TILE }: { x: number; y: number; size?: number }) {
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={x} y={y} width={size} height={size} fill="#5A3A1E" />
      <rect x={x} y={y + 5} width={size} height={3} fill="#3D2614" opacity="0.7" />
      <rect x={x} y={y + 13} width={size} height={3} fill="#3D2614" opacity="0.7" />
      <rect x={x} y={y + 21} width={size} height={3} fill="#3D2614" opacity="0.7" />
      <rect x={x} y={y + 2} width={size} height={1} fill="#7C5230" opacity="0.7" />
      <rect x={x} y={y + 10} width={size} height={1} fill="#7C5230" opacity="0.7" />
      <rect x={x} y={y + 18} width={size} height={1} fill="#7C5230" opacity="0.7" />
    </g>
  );
}

/** Mowed-lawn grass for the deco zone, with alternating mow stripes. */
export function GrassSoil({
  x,
  y,
  col,
  row,
  size = PLOT_TILE,
}: {
  x: number;
  y: number;
  col: number;
  row: number;
  size?: number;
}) {
  const seed = (((col * 131 + row * 53) % 7) + 7) % 7;
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={x} y={y} width={size} height={size} fill="#7CC457" />
      {row % 2 === 0 && (
        <rect x={x} y={y} width={size} height={size} fill="#85CC60" opacity="0.6" />
      )}
      <rect x={x} y={y} width={size} height={1} fill="#9AD46E" opacity="0.6" />
      <rect x={x} y={y + size - 1} width={size} height={1} fill="#5FA73F" opacity="0.5" />
      {seed === 0 && <rect x={x + 5} y={y + 7} width={2} height={2} fill="#5FA73F" opacity="0.7" />}
      {seed === 1 && (
        <rect x={x + 15} y={y + 11} width={2} height={2} fill="#9AD46E" opacity="0.8" />
      )}
      {seed === 2 && (
        <rect x={x + 20} y={y + 5} width={2} height={2} fill="#5FA73F" opacity="0.7" />
      )}
      {seed === 3 && (
        <rect x={x + 9} y={y + 18} width={2} height={2} fill="#5FA73F" opacity="0.7" />
      )}
      {seed === 4 && (
        <rect x={x + 17} y={y + 20} width={2} height={2} fill="#9AD46E" opacity="0.8" />
      )}
      {seed === 5 && (
        <rect x={x + 7} y={y + 13} width={2} height={2} fill="#9AD46E" opacity="0.7" />
      )}
      {seed === 6 && (
        <rect x={x + 22} y={y + 15} width={2} height={2} fill="#5FA73F" opacity="0.7" />
      )}
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.5"
      />
    </g>
  );
}

/** Slightly-trampled grass — used for hover state on the deco zone. */
export function HoverGrass({ x, y, size = PLOT_TILE }: { x: number; y: number; size?: number }) {
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={x} y={y} width={size} height={size} fill="#69B448" />
      <rect x={x} y={y} width={size} height={1} fill="#85CC60" opacity="0.7" />
      <rect x={x} y={y + size - 1} width={size} height={1} fill="#4F9135" opacity="0.6" />
    </g>
  );
}

export type { GroundType };
