// garden-tab.jsx — Stardew-style top-down farm + planting flow — exported to window

// ── Deco catalog (shop items the user can buy & place) ───────────────────────
const RARITY_COLOR = { common: "#7AA67D", rare: "#5694C9", epic: "#A06FD0", legendary: "#E0A93A" };
const DECO_CATALOG = [
  { id: "stone_path", icon: "🪨", name: "Stone Path", rarity: "common", cost: 25 },
  { id: "fence", icon: "🪵", name: "Picket Fence", rarity: "common", cost: 30 },
  { id: "bench", icon: "🪑", name: "Garden Bench", rarity: "common", cost: 40 },
  { id: "lantern", icon: "🏮", name: "Lantern", rarity: "rare", cost: 75 },
  { id: "birdbath", icon: "🐦", name: "Bird Bath", rarity: "rare", cost: 90 },
  { id: "windmill", icon: "🌀", name: "Windmill", rarity: "rare", cost: 110 },
  { id: "arch", icon: "🌸", name: "Flower Arch", rarity: "epic", cost: 160 },
  { id: "koi_pond", icon: "🐠", name: "Koi Pond", rarity: "epic", cost: 200 },
  { id: "fountain", icon: "⛲", name: "Fountain", rarity: "legendary", cost: 300 },
  { id: "pagoda", icon: "⛩️", name: "Pagoda", rarity: "legendary", cost: 420 },
];

// ── Grid geometry ─────────────────────────────────────────────────────────────
// Top-down pixel-art canvas. Inner tilled-plot grid is G_COLS×G_ROWS (data model).
const TILE = 24; // outer scenery tile size (px)
const PLOT_TILE = 28; // tilled-plot tile size (slightly bigger so plants are readable)
const G_COLS = 8,
  G_ROWS = 6; // plot dimensions (data model)
// Two zones inside the plot:
//   • rows 0 .. PLANT_ROW_START-1 → grass (decorations only)
//   • rows PLANT_ROW_START .. G_ROWS-1 → tilled soil (seeds only)
const PLANT_ROW_START = 4; // last 2 rows are tilled (plantable)
const isPlantingRow = (row) => row >= PLANT_ROW_START;
const isGrassRow = (row) => row < PLANT_ROW_START;
const SCENE_COLS = 14,
  SCENE_ROWS = 11;
const SVG_W = SCENE_COLS * TILE; // 336
const SVG_H = SCENE_ROWS * TILE; // 264

// Where the tilled plot sits inside the scene (in scene-tile coords)
const PLOT_OX = 2; // 2 tiles in from left
const PLOT_OY = 2.6; // ~2.6 tiles down from top
const PLOT_W = G_COLS * PLOT_TILE;
const PLOT_H = G_ROWS * PLOT_TILE;
const PLOT_PX = PLOT_OX * TILE;
const PLOT_PY = PLOT_OY * TILE;

function plotTileXY(col, row) {
  return { x: PLOT_PX + col * PLOT_TILE, y: PLOT_PY + row * PLOT_TILE };
}
function plotTileCenter(col, row) {
  const { x, y } = plotTileXY(col, row);
  return { cx: x + PLOT_TILE / 2, cy: y + PLOT_TILE / 2 };
}

// ── Pixel-art ground tile painter ─────────────────────────────────────────────
// Each scene tile gets a base type. We hand-place a layout for a Stardew vibe:
// grass everywhere, with a path, water pond, sand strip, scattered scenery.
// 'g' grass · 'G' dark grass · 'p' dirt path · 'w' water · 's' sand · '.' (empty marker, treated as grass)
const SCENE_LAYOUT = [
  // 14 cols wide, 11 rows tall (each char = one scene tile)
  "gggggggggggggg",
  "GGgggggggggggg",
  "gggggggppppppg",
  "gggggggggggppg", // path winds along right side then down
  "gggggggggggppg",
  "gggggggggggppg",
  "gggggggggggppg",
  "gggggggggggppg",
  "gGggggggggggpg",
  "GGgggggssswwwg",
  "gggggssswwwwwg",
];

// Trees / rocks / bushes as scene-decoration overlays at (col,row) tile coords
const SCENE_DECOR = [
  { x: 0.3, y: 0.2, type: "tree_pine", scale: 1.0 },
  { x: 1.5, y: 0.6, type: "tree_round", scale: 0.9 },
  { x: 0.8, y: 1.4, type: "tree_pine", scale: 0.8 },
  { x: 11.4, y: 0.4, type: "tree_round", scale: 1.0 },
  { x: 12.6, y: 1.5, type: "tree_pine", scale: 0.95 },
  { x: 0.2, y: 8.4, type: "tree_round", scale: 0.95 },
  { x: 1.6, y: 9.6, type: "tree_pine", scale: 0.85 },
  { x: 12.7, y: 7.6, type: "tree_round", scale: 0.9 },
  // ground rocks
  { x: 1.0, y: 5.0, type: "rock", scale: 0.8 },
  { x: 0.6, y: 7.2, type: "rock_small", scale: 0.9 },
  { x: 12.4, y: 4.0, type: "rock_small", scale: 1.0 },
  { x: 12.8, y: 9.4, type: "flower_bush", scale: 1.0 },
  { x: 0.4, y: 3.4, type: "flower_bush", scale: 0.9 },
  { x: 12.4, y: 5.5, type: "flower_bush", scale: 0.9 },
  // small grass tufts scattered
  { x: 3.5, y: 9.0, type: "grass_tuft", scale: 1 },
  { x: 5.0, y: 9.4, type: "grass_tuft", scale: 1 },
  { x: 8.0, y: 0.4, type: "grass_tuft", scale: 1 },
  { x: 6.0, y: 1.4, type: "grass_tuft", scale: 1 },
  { x: 9.5, y: 9.5, type: "grass_tuft", scale: 1 },
  // signpost near the plot
  { x: 1.5, y: 2.2, type: "signpost", scale: 1 },
  // wishing well right of plot bottom
  { x: 10.4, y: 8.0, type: "well", scale: 1 },
];

// ── Pixel-style ground tiles (drawn with small rects for the chunky look) ────
function GroundTile({ x, y, type }) {
  // Base color per type; we add 1-2 darker pixel "studs" for Stardew-like texture.
  const palette = {
    g: { base: "#7CC457", dark: "#5FA73F", light: "#9AD46E" }, // grass
    G: { base: "#69B448", dark: "#4F9135", light: "#85C75E" }, // dark grass patch
    p: { base: "#C9A06A", dark: "#A37D4D", light: "#DDB682" }, // dirt path
    w: { base: "#4DA8D6", dark: "#2E7CA8", light: "#79C5E6" }, // water
    s: { base: "#E8D08A", dark: "#C7AC6A", light: "#F2DFA6" }, // sand
  };
  const p = palette[type] || palette.g;
  // deterministic per-tile speckle pattern
  const seed = (((x * 131 + y * 53) % 7) + 7) % 7;
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={x} y={y} width={TILE} height={TILE} fill={p.base} />
      {/* edge dither — top-left highlight, bottom-right shadow */}
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

// ── Tilled soil tile (the plot's base) ───────────────────────────────────────
function TilledSoil({ x, y, size = PLOT_TILE }) {
  // Stardew-style brown soil with horizontal furrow rows.
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={x} y={y} width={size} height={size} fill="#7A4F2C" />
      {/* darker horizontal furrows */}
      <rect x={x} y={y + 5} width={size} height={3} fill="#5C3A1F" opacity="0.55" />
      <rect x={x} y={y + 13} width={size} height={3} fill="#5C3A1F" opacity="0.55" />
      <rect x={x} y={y + 21} width={size} height={3} fill="#5C3A1F" opacity="0.55" />
      {/* highlight on top of each furrow ridge */}
      <rect x={x} y={y + 2} width={size} height={1} fill="#9C6B3F" opacity="0.75" />
      <rect x={x} y={y + 10} width={size} height={1} fill="#9C6B3F" opacity="0.75" />
      <rect x={x} y={y + 18} width={size} height={1} fill="#9C6B3F" opacity="0.75" />
      {/* tile border (subtle) */}
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

// ── Watered (wet) soil — slightly darker for selection / hover ──────────────
function WetSoil({ x, y, size = PLOT_TILE }) {
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

// ── Grass tile (the deco zone's base — top rows of the plot) ────────────────
// Stardew-style mowed lawn: brighter than scenery grass + faint tile seam,
// so it reads as part of the same plot grid as the tilled rows below.
function GrassSoil({ x, y, col, row, size = PLOT_TILE }) {
  const seed = (((col * 131 + row * 53) % 7) + 7) % 7;
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={x} y={y} width={size} height={size} fill="#7CC457" />
      {/* mow stripe (alternating row shades for that manicured-lawn look) */}
      {row % 2 === 0 && (
        <rect x={x} y={y} width={size} height={size} fill="#85CC60" opacity="0.6" />
      )}
      {/* edge dither */}
      <rect x={x} y={y} width={size} height={1} fill="#9AD46E" opacity="0.6" />
      <rect x={x} y={y + size - 1} width={size} height={1} fill="#5FA73F" opacity="0.5" />
      {/* speckles — grass blades */}
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
      {/* very faint tile seam so the grid reads */}
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

// ── Hovered grass tile (slightly trampled / highlighted) ────────────────────
function HoverGrass({ x, y, size = PLOT_TILE }) {
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={x} y={y} width={size} height={size} fill="#69B448" />
      <rect x={x} y={y} width={size} height={1} fill="#85CC60" opacity="0.7" />
      <rect x={x} y={y + size - 1} width={size} height={1} fill="#4F9135" opacity="0.6" />
    </g>
  );
}

// ── Pixel-art scenery sprites (top-down, chunky shapes) ──────────────────────
function ScenerySprite({ x, y, type, scale = 1 }) {
  const px = x * TILE,
    py = y * TILE;
  const s = scale;

  switch (type) {
    case "tree_pine":
      return (
        <g
          shapeRendering="crispEdges"
          transform={`translate(${px},${py})`}
          style={{ pointerEvents: "none" }}
        >
          {/* shadow */}
          <ellipse cx={20 * s} cy={42 * s} rx={14 * s} ry={4 * s} fill="rgba(0,0,0,0.25)" />
          {/* trunk */}
          <rect x={16 * s} y={32 * s} width={8 * s} height={12 * s} fill="#5B3A21" />
          <rect x={16 * s} y={32 * s} width={3 * s} height={12 * s} fill="#3F2715" />
          {/* foliage — chunky pixel triangles */}
          <rect x={6 * s} y={20 * s} width={28 * s} height={14 * s} fill="#2F6B2C" />
          <rect x={4 * s} y={22 * s} width={2 * s} height={10 * s} fill="#1F4F1E" />
          <rect x={34 * s} y={22 * s} width={2 * s} height={10 * s} fill="#1F4F1E" />
          <rect x={9 * s} y={11 * s} width={22 * s} height={12 * s} fill="#3A8B36" />
          <rect x={7 * s} y={13 * s} width={2 * s} height={9 * s} fill="#2F6B2C" />
          <rect x={31 * s} y={13 * s} width={2 * s} height={9 * s} fill="#2F6B2C" />
          <rect x={12 * s} y={4 * s} width={16 * s} height={9 * s} fill="#4FA64A" />
          <rect x={10 * s} y={6 * s} width={2 * s} height={6 * s} fill="#3A8B36" />
          <rect x={28 * s} y={6 * s} width={2 * s} height={6 * s} fill="#3A8B36" />
          {/* highlight */}
          <rect x={14 * s} y={6 * s} width={3 * s} height={3 * s} fill="#7BCB6F" opacity="0.9" />
          <rect x={11 * s} y={14 * s} width={3 * s} height={2 * s} fill="#7BCB6F" opacity="0.7" />
        </g>
      );
    case "tree_round":
      return (
        <g
          shapeRendering="crispEdges"
          transform={`translate(${px},${py})`}
          style={{ pointerEvents: "none" }}
        >
          <ellipse cx={20 * s} cy={42 * s} rx={16 * s} ry={4 * s} fill="rgba(0,0,0,0.25)" />
          <rect x={16 * s} y={28 * s} width={8 * s} height={14 * s} fill="#5B3A21" />
          <rect x={16 * s} y={28 * s} width={3 * s} height={14 * s} fill="#3F2715" />
          {/* canopy — chunky lobes */}
          <rect x={4 * s} y={14 * s} width={32 * s} height={16 * s} fill="#3A8B36" />
          <rect x={2 * s} y={18 * s} width={2 * s} height={10 * s} fill="#2F6B2C" />
          <rect x={36 * s} y={18 * s} width={2 * s} height={10 * s} fill="#2F6B2C" />
          <rect x={4 * s} y={12 * s} width={4 * s} height={2 * s} fill="#3A8B36" />
          <rect x={32 * s} y={12 * s} width={4 * s} height={2 * s} fill="#3A8B36" />
          <rect x={8 * s} y={6 * s} width={24 * s} height={8 * s} fill="#4FA64A" />
          <rect x={6 * s} y={8 * s} width={2 * s} height={5 * s} fill="#3A8B36" />
          <rect x={32 * s} y={8 * s} width={2 * s} height={5 * s} fill="#3A8B36" />
          <rect x={12 * s} y={2 * s} width={16 * s} height={5 * s} fill="#5FB75A" />
          {/* highlight */}
          <rect x={12 * s} y={5 * s} width={4 * s} height={3 * s} fill="#85D578" opacity="0.95" />
          <rect x={10 * s} y={11 * s} width={3 * s} height={3 * s} fill="#7BCB6F" opacity="0.85" />
          {/* a few apple/berry dots */}
          <rect x={16 * s} y={15 * s} width={2 * s} height={2 * s} fill="#E25555" />
          <rect x={26 * s} y={20 * s} width={2 * s} height={2 * s} fill="#E25555" />
          <rect x={9 * s} y={22 * s} width={2 * s} height={2 * s} fill="#E25555" />
        </g>
      );
    case "rock":
      return (
        <g
          shapeRendering="crispEdges"
          transform={`translate(${px},${py})`}
          style={{ pointerEvents: "none" }}
        >
          <ellipse cx={12 * s} cy={20 * s} rx={10 * s} ry={3 * s} fill="rgba(0,0,0,0.22)" />
          <rect x={4 * s} y={6 * s} width={16 * s} height={12 * s} fill="#9D9D95" />
          <rect x={6 * s} y={4 * s} width={12 * s} height={4 * s} fill="#9D9D95" />
          <rect x={4 * s} y={6 * s} width={3 * s} height={12 * s} fill="#7A7A72" />
          <rect x={17 * s} y={6 * s} width={3 * s} height={12 * s} fill="#7A7A72" />
          <rect x={4 * s} y={16 * s} width={16 * s} height={2 * s} fill="#5C5C55" />
          <rect x={7 * s} y={5 * s} width={4 * s} height={2 * s} fill="#C2C2BB" />
          <rect x={9 * s} y={9 * s} width={3 * s} height={2 * s} fill="#C2C2BB" opacity="0.7" />
        </g>
      );
    case "rock_small":
      return (
        <g
          shapeRendering="crispEdges"
          transform={`translate(${px},${py})`}
          style={{ pointerEvents: "none" }}
        >
          <ellipse cx={9 * s} cy={14 * s} rx={7 * s} ry={2 * s} fill="rgba(0,0,0,0.22)" />
          <rect x={3 * s} y={6 * s} width={12 * s} height={8 * s} fill="#9D9D95" />
          <rect x={3 * s} y={6 * s} width={3 * s} height={8 * s} fill="#7A7A72" />
          <rect x={3 * s} y={12 * s} width={12 * s} height={2 * s} fill="#5C5C55" />
          <rect x={5 * s} y={5 * s} width={3 * s} height={2 * s} fill="#C2C2BB" />
        </g>
      );
    case "flower_bush":
      return (
        <g
          shapeRendering="crispEdges"
          transform={`translate(${px},${py})`}
          style={{ pointerEvents: "none" }}
        >
          <ellipse cx={14 * s} cy={26 * s} rx={12 * s} ry={3 * s} fill="rgba(0,0,0,0.22)" />
          {/* bush body */}
          <rect x={4 * s} y={12 * s} width={20 * s} height={12 * s} fill="#3A8B36" />
          <rect x={2 * s} y={14 * s} width={2 * s} height={8 * s} fill="#2F6B2C" />
          <rect x={24 * s} y={14 * s} width={2 * s} height={8 * s} fill="#2F6B2C" />
          <rect x={4 * s} y={22 * s} width={20 * s} height={2 * s} fill="#1F4F1E" />
          <rect x={6 * s} y={8 * s} width={16 * s} height={6 * s} fill="#4FA64A" />
          <rect x={8 * s} y={6 * s} width={12 * s} height={4 * s} fill="#5FB75A" />
          {/* flowers */}
          <rect x={8 * s} y={10 * s} width={2 * s} height={2 * s} fill="#FFD24D" />
          <rect x={14 * s} y={9 * s} width={2 * s} height={2 * s} fill="#F47BC4" />
          <rect x={20 * s} y={11 * s} width={2 * s} height={2 * s} fill="#F47BC4" />
          <rect x={11 * s} y={14 * s} width={2 * s} height={2 * s} fill="#FFD24D" />
          <rect x={17 * s} y={16 * s} width={2 * s} height={2 * s} fill="#FFFFFF" />
          <rect x={6 * s} y={17 * s} width={2 * s} height={2 * s} fill="#9F6BD9" />
          <rect x={22 * s} y={18 * s} width={2 * s} height={2 * s} fill="#9F6BD9" />
        </g>
      );
    case "grass_tuft":
      return (
        <g
          shapeRendering="crispEdges"
          transform={`translate(${px},${py})`}
          style={{ pointerEvents: "none" }}
        >
          <rect x={4 * s} y={14 * s} width={2 * s} height={6 * s} fill="#3A8B36" />
          <rect x={8 * s} y={10 * s} width={2 * s} height={10 * s} fill="#4FA64A" />
          <rect x={12 * s} y={12 * s} width={2 * s} height={8 * s} fill="#3A8B36" />
          <rect x={16 * s} y={14 * s} width={2 * s} height={6 * s} fill="#5FB75A" />
          <rect x={6 * s} y={20 * s} width={12 * s} height={1 * s} fill="rgba(0,0,0,0.18)" />
        </g>
      );
    case "signpost":
      return (
        <g
          shapeRendering="crispEdges"
          transform={`translate(${px},${py})`}
          style={{ pointerEvents: "none" }}
        >
          <ellipse cx={10 * s} cy={26 * s} rx={6 * s} ry={2 * s} fill="rgba(0,0,0,0.22)" />
          <rect x={9 * s} y={14 * s} width={3 * s} height={12 * s} fill="#5B3A21" />
          <rect x={9 * s} y={14 * s} width={1 * s} height={12 * s} fill="#3F2715" />
          <rect x={2 * s} y={6 * s} width={18 * s} height={10 * s} fill="#9C6B3F" />
          <rect x={2 * s} y={6 * s} width={18 * s} height={2 * s} fill="#C08C57" />
          <rect x={2 * s} y={14 * s} width={18 * s} height={2 * s} fill="#5B3A21" />
          <rect x={2 * s} y={6 * s} width={2 * s} height={10 * s} fill="#5B3A21" />
          <rect x={18 * s} y={6 * s} width={2 * s} height={10 * s} fill="#5B3A21" />
          {/* "FARM" little engraving lines */}
          <rect x={5 * s} y={9 * s} width={3 * s} height={1 * s} fill="#3F2715" />
          <rect x={5 * s} y={11 * s} width={4 * s} height={1 * s} fill="#3F2715" />
          <rect x={11 * s} y={9 * s} width={5 * s} height={1 * s} fill="#3F2715" />
          <rect x={11 * s} y={11 * s} width={3 * s} height={1 * s} fill="#3F2715" />
        </g>
      );
    case "well":
      return (
        <g
          shapeRendering="crispEdges"
          transform={`translate(${px},${py})`}
          style={{ pointerEvents: "none" }}
        >
          <ellipse cx={18 * s} cy={36 * s} rx={16 * s} ry={3 * s} fill="rgba(0,0,0,0.25)" />
          {/* base stones */}
          <rect x={4 * s} y={20 * s} width={28 * s} height={14 * s} fill="#9D9D95" />
          <rect x={4 * s} y={20 * s} width={28 * s} height={2 * s} fill="#C2C2BB" />
          <rect x={4 * s} y={32 * s} width={28 * s} height={2 * s} fill="#5C5C55" />
          {[6, 12, 18, 24].map((xx) => (
            <rect key={xx} x={xx * s} y={22 * s} width={1 * s} height={10 * s} fill="#5C5C55" />
          ))}
          {/* water */}
          <rect x={8 * s} y={22 * s} width={20 * s} height={9 * s} fill="#3F8FB8" />
          <rect x={8 * s} y={22 * s} width={20 * s} height={2 * s} fill="#5BB1D8" />
          {/* posts + roof */}
          <rect x={6 * s} y={4 * s} width={3 * s} height={18 * s} fill="#5B3A21" />
          <rect x={27 * s} y={4 * s} width={3 * s} height={18 * s} fill="#5B3A21" />
          <rect x={2 * s} y={2 * s} width={32 * s} height={5 * s} fill="#A93A2A" />
          <rect x={2 * s} y={2 * s} width={32 * s} height={1 * s} fill="#D45A47" />
          <rect x={2 * s} y={6 * s} width={32 * s} height={1 * s} fill="#7A2017" />
        </g>
      );
    default:
      return null;
  }
}

// ── Background trees & rocks scenery layer ──────────────────────────────────
function FarmScenery() {
  // Simple sky band at top (gives an outdoor feel) — actually we want full overhead grass.
  // We'll just paint each scene tile.
  const rows = SCENE_LAYOUT;
  return (
    <g style={{ pointerEvents: "none" }}>
      {/* outer canvas base */}
      <rect width={SVG_W} height={SVG_H} fill="#5FA73F" />
      {/* paint each tile */}
      {rows.map((row, r) =>
        [...row].map((ch, c) => (
          <GroundTile key={`${c}-${r}`} x={c * TILE} y={r * TILE} type={ch} />
        )),
      )}
      {/* fence around the tilled plot */}
      <FarmFence />
      {/* scenery decorations */}
      {SCENE_DECOR.map((d, i) => (
        <ScenerySprite key={i} x={d.x} y={d.y} type={d.type} scale={d.scale} />
      ))}
    </g>
  );
}

// ── Pixel fence around the plot ───────────────────────────────────────────────
function FarmFence() {
  const fx = PLOT_PX - 6,
    fy = PLOT_PY - 6;
  const fw = PLOT_W + 12,
    fh = PLOT_H + 12;
  // posts + horizontal rails along the top + bottom + left + right
  const posts = [];
  const POST_GAP = 28;
  for (let x = fx; x <= fx + fw; x += POST_GAP) posts.push({ x, y: fy });
  for (let x = fx; x <= fx + fw; x += POST_GAP) posts.push({ x, y: fy + fh - 4 });
  for (let y = fy + POST_GAP; y < fy + fh - 4; y += POST_GAP) posts.push({ x: fx, y });
  for (let y = fy + POST_GAP; y < fy + fh - 4; y += POST_GAP) posts.push({ x: fx + fw - 4, y });
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      {/* horizontal rails (top + bottom) */}
      <rect x={fx} y={fy} width={fw} height={3} fill="#7A4F2C" />
      <rect x={fx} y={fy + 3} width={fw} height={1} fill="#5B3A21" />
      <rect x={fx} y={fy + fh - 4} width={fw} height={3} fill="#7A4F2C" />
      <rect x={fx} y={fy + fh - 1} width={fw} height={1} fill="#5B3A21" />
      {/* vertical rails */}
      <rect x={fx} y={fy} width={3} height={fh} fill="#7A4F2C" />
      <rect x={fx + 3} y={fy} width={1} height={fh} fill="#5B3A21" />
      <rect x={fx + fw - 4} y={fy} width={3} height={fh} fill="#7A4F2C" />
      <rect x={fx + fw - 1} y={fy} width={1} height={fh} fill="#5B3A21" />
      {/* posts */}
      {posts.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y - 3} width={4} height={9} fill="#9C6B3F" />
          <rect x={p.x} y={p.y - 3} width={1} height={9} fill="#5B3A21" />
          <rect x={p.x + 3} y={p.y - 3} width={1} height={9} fill="#5B3A21" />
        </g>
      ))}
      {/* gate opening at top-center: erase a 2-tile-wide section */}
      <rect
        x={fx + fw / 2 - PLOT_TILE}
        y={fy - 2}
        width={PLOT_TILE * 2}
        height={6}
        fill="#7A4F2C"
      />
      <rect
        x={fx + fw / 2 - PLOT_TILE + 1}
        y={fy}
        width={PLOT_TILE * 2 - 2}
        height={2}
        fill="#5FA73F"
      />
    </g>
  );
}

// ── Pixel-art crops/plants (top-down, tied to growth stage) ──────────────────
// We re-implement the existing plant types in a Stardew-style pixel form.
// Kept the same plantId so existing goal data renders correctly.
function TilePlant({ plantId, stage, cx, cy, onClick, isSelected, healthState = "healthy" }) {
  // Plant occupies the tile centered on (cx, cy). ~24px sprite area.
  const x = cx - 12,
    y = cy - 14; // top-left of 24×24-ish sprite
  const isDead = healthState === "dead";
  const tint = (() => {
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
  })();

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

    const fruit = (color, accent = "#fff") => (
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

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
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

// ── Pixel-art deco sprites — placed by the user on plot tiles ────────────────
function DecoSprite({ type, cx, cy }) {
  const x = cx - 12,
    y = cy - 14;
  const common = (children) => (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <ellipse cx={cx} cy={cy + 9} rx="9" ry="2" fill="rgba(0,0,0,0.22)" />
      {children}
    </g>
  );

  switch (type) {
    case "stone_path":
      return common(
        <>
          <rect x={x + 4} y={y + 10} width={5} height={4} fill="#A0A09A" />
          <rect x={x + 11} y={y + 8} width={5} height={4} fill="#A0A09A" />
          <rect x={x + 5} y={y + 15} width={5} height={4} fill="#A0A09A" />
          <rect x={x + 13} y={y + 14} width={5} height={4} fill="#A0A09A" />
          <rect x={x + 4} y={y + 10} width={5} height={1} fill="#C2C2BB" />
          <rect x={x + 11} y={y + 8} width={5} height={1} fill="#C2C2BB" />
          <rect x={x + 5} y={y + 15} width={5} height={1} fill="#C2C2BB" />
          <rect x={x + 13} y={y + 14} width={5} height={1} fill="#C2C2BB" />
        </>,
      );
    case "lantern":
      return common(
        <>
          <rect x={x + 10} y={y + 14} width={4} height={8} fill="#3F3F3F" />
          <rect x={x + 9} y={y + 5} width={6} height={9} fill="#5C5C55" />
          <rect x={x + 9} y={y + 5} width={6} height={1} fill="#3F3F3F" />
          <rect x={x + 8} y={y + 3} width={8} height={2} fill="#3F3F3F" />
          <rect x={x + 10} y={y + 7} width={4} height={5} fill="#FFE07A" />
          <rect x={x + 10} y={y + 7} width={1} height={5} fill="#FFC940" />
        </>,
      );
    case "fence":
      return common(
        <>
          {[5, 11, 17].map((xx) => (
            <g key={xx}>
              <rect x={x + xx} y={y + 5} width={2} height={15} fill="#9C6B3F" />
              <rect x={x + xx} y={y + 5} width={1} height={15} fill="#5B3A21" />
            </g>
          ))}
          <rect x={x + 4} y={y + 9} width={16} height={2} fill="#9C6B3F" />
          <rect x={x + 4} y={y + 15} width={16} height={2} fill="#9C6B3F" />
        </>,
      );
    case "bench":
      return common(
        <>
          <rect x={x + 3} y={y + 8} width={18} height={3} fill="#9C6B3F" />
          <rect x={x + 3} y={y + 11} width={18} height={1} fill="#5B3A21" />
          <rect x={x + 5} y={y + 11} width={3} height={8} fill="#5B3A21" />
          <rect x={x + 16} y={y + 11} width={3} height={8} fill="#5B3A21" />
          <rect x={x + 3} y={y + 5} width={18} height={2} fill="#9C6B3F" />
        </>,
      );
    case "birdbath":
      return common(
        <>
          <rect x={x + 11} y={y + 10} width={2} height={9} fill="#9D9D95" />
          <rect x={x + 11} y={y + 10} width={1} height={9} fill="#7A7A72" />
          <rect x={x + 6} y={y + 5} width={12} height={5} fill="#9D9D95" />
          <rect x={x + 6} y={y + 5} width={12} height={1} fill="#C2C2BB" />
          <rect x={x + 8} y={y + 6} width={8} height={3} fill="#5BB1D8" />
          <rect x={x + 9} y={y + 6} width={5} height={1} fill="#9CDDF0" />
        </>,
      );
    case "windmill":
      return common(
        <>
          <rect x={x + 11} y={y + 10} width={2} height={12} fill="#7A7A72" />
          <rect x={x + 10} y={y + 5} width={4} height={4} fill="#5C5C55" />
          <rect x={x + 11} y={y + 1} width={2} height={4} fill="#C2C2BB" />
          <rect x={x + 11} y={y + 9} width={2} height={4} fill="#C2C2BB" />
          <rect x={x + 5} y={y + 6} width={5} height={2} fill="#C2C2BB" />
          <rect x={x + 14} y={y + 6} width={5} height={2} fill="#C2C2BB" />
        </>,
      );
    case "arch":
      return common(
        <>
          <rect x={x + 4} y={y + 5} width={2} height={16} fill="#5B3A21" />
          <rect x={x + 18} y={y + 5} width={2} height={16} fill="#5B3A21" />
          <rect x={x + 4} y={y + 5} width={16} height={2} fill="#5B3A21" />
          <rect x={x + 6} y={y + 3} width={2} height={2} fill="#F47BC4" />
          <rect x={x + 11} y={y + 1} width={2} height={2} fill="#F47BC4" />
          <rect x={x + 16} y={y + 3} width={2} height={2} fill="#F47BC4" />
          <rect x={x + 9} y={y + 8} width={2} height={2} fill="#F47BC4" />
          <rect x={x + 13} y={y + 11} width={2} height={2} fill="#F47BC4" />
        </>,
      );
    case "fountain":
      return common(
        <>
          <rect x={x + 3} y={y + 15} width={18} height={6} fill="#9D9D95" />
          <rect x={x + 3} y={y + 15} width={18} height={1} fill="#C2C2BB" />
          <rect x={x + 5} y={y + 16} width={14} height={4} fill="#5BB1D8" />
          <rect x={x + 5} y={y + 16} width={14} height={1} fill="#9CDDF0" />
          <rect x={x + 10} y={y + 8} width={4} height={8} fill="#9D9D95" />
          <rect x={x + 8} y={y + 5} width={8} height={3} fill="#9D9D95" />
          <rect x={x + 11} y={y + 2} width={2} height={4} fill="#9CDDF0" />
          <rect x={x + 9} y={y + 1} width={1} height={3} fill="#9CDDF0" opacity="0.7" />
          <rect x={x + 14} y={y + 1} width={1} height={3} fill="#9CDDF0" opacity="0.7" />
        </>,
      );
    case "koi_pond":
      return common(
        <>
          <rect x={x + 2} y={y + 8} width={20} height={14} fill="#3F8FB8" />
          <rect x={x + 2} y={y + 8} width={20} height={2} fill="#5BB1D8" />
          <rect x={x + 2} y={y + 20} width={20} height={2} fill="#2E7CA8" />
          <rect x={x + 5} y={y + 11} width={4} height={2} fill="#FF9A55" />
          <rect x={x + 13} y={y + 15} width={4} height={2} fill="#FFFFFF" />
          <rect x={x + 9} y={y + 18} width={3} height={1} fill="#FF9A55" />
        </>,
      );
    case "pagoda":
      return common(
        <>
          <rect x={x + 8} y={y + 13} width={8} height={8} fill="#9C6B3F" />
          <rect x={x + 8} y={y + 13} width={2} height={8} fill="#5B3A21" />
          <rect x={x + 5} y={y + 9} width={14} height={4} fill="#A93A2A" />
          <rect x={x + 5} y={y + 9} width={14} height={1} fill="#D45A47" />
          <rect x={x + 7} y={y + 5} width={10} height={4} fill="#A93A2A" />
          <rect x={x + 7} y={y + 5} width={10} height={1} fill="#D45A47" />
          <rect x={x + 11} y={y + 1} width={2} height={4} fill="#FFC940" />
        </>,
      );
    default:
      return null;
  }
}

// ── Unplanted seed packet (used in the drawer) ───────────────────────────────
function SeedPacket({ plantDef, goalTitle }) {
  return (
    <svg width="52" height="60" viewBox="0 0 52 60" shapeRendering="crispEdges">
      <rect x="6" y="8" width="40" height="44" fill="#FFF8E1" />
      <rect x="6" y="8" width="40" height="2" fill="#F2A91D" />
      <rect x="6" y="50" width="40" height="2" fill="#9C6B3F" />
      <rect x="6" y="8" width="2" height="44" fill="#F2A91D" />
      <rect x="44" y="8" width="2" height="44" fill="#9C6B3F" />
      <rect x="6" y="8" width="40" height="10" fill="#FFC940" />
      <rect x="6" y="8" width="40" height="2" fill="#F2A91D" />
      <rect x="6" y="14" width="40" height="2" fill="#9C6B3F" />
      {/* seed */}
      <rect x="20" y="26" width="12" height="14" fill="#3A8B36" />
      <rect x="22" y="24" width="8" height="2" fill="#5FB75A" />
      <rect x="20" y="26" width="3" height="14" fill="#2F6B2C" />
      <rect x="24" y="29" width="2" height="2" fill="#FFFFFF" opacity="0.4" />
      {/* root */}
      <rect x="24" y="40" width="1" height="4" fill="#5B3A21" />
      <rect x="27" y="40" width="1" height="4" fill="#5B3A21" />
    </svg>
  );
}

// ── Main farm grid ──────────────────────────────────────────────────────────
function IsometricGarden({
  goals,
  decoGrid,
  onTilePlantClick,
  onDecoTileClick,
  placingGoalId,
  placingDeco,
  selectedGoalId,
}) {
  const [hov, setHov] = React.useState(null);

  const plantedGoals = goals.filter((g) => g.planted && g.tileCol != null);
  const plantMap = {};
  plantedGoals.forEach((g) => {
    plantMap[`${g.tileCol}-${g.tileRow}`] = g;
  });

  const tiles = [];
  for (let c = 0; c < G_COLS; c++) for (let r = 0; r < G_ROWS; r++) tiles.push({ col: c, row: r });
  // Top-down: render row by row so plants in lower rows overlap upper ones if they overflow.
  tiles.sort((a, b) => a.row - b.row || a.col - b.col);

  return (
    <svg
      width={SVG_W}
      height={SVG_H}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ display: "block", width: "100%", imageRendering: "pixelated" }}
    >
      <FarmScenery />

      {/* Tilled soil plot — every tile is plantable */}
      {tiles.map(({ col, row }) => {
        const { x, y } = plotTileXY(col, row);
        const key = `${col}-${row}`;
        const plantGoal = plantMap[key];
        const decoItem = decoGrid[col]?.[row];
        const isFree = !plantGoal && !decoItem;
        const isHover = hov === key;
        const placing = !!(placingGoalId || placingDeco);
        const grass = isGrassRow(row);
        // A tile is "compatible" with what the user is currently placing:
        //   • planting a seed → only tilled rows
        //   • placing a deco  → only grass rows
        const compatible = placingGoalId ? !grass : placingDeco ? grass : true;
        const showInvalidHover = isHover && placing && (!isFree || !compatible);
        const showValidHover = isHover && isFree && compatible;

        return (
          <g
            key={key}
            onMouseEnter={() => setHov(key)}
            onMouseLeave={() => setHov(null)}
            onClick={() => {
              if (plantGoal) onTilePlantClick(plantGoal.id);
              else if (placingGoalId && isFree && !grass) onDecoTileClick(col, row, "plant");
              else if (placingDeco && isFree && grass) onDecoTileClick(col, row, "deco");
              else if (isFree && !placing) onDecoTileClick(col, row, "empty");
            }}
            style={{
              cursor: plantGoal || (isFree && (!placing || compatible)) ? "pointer" : "default",
            }}
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
            {/* invisible hit-target — soil sub-rects have pointerEvents:none */}
            <rect
              x={x}
              y={y}
              width={PLOT_TILE}
              height={PLOT_TILE}
              fill="transparent"
              style={{ pointerEvents: "all" }}
            />
            {/* hover/place highlight */}
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

      {/* Subtle divider line between deco (grass) and planting (soil) zones */}
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

      {/* Decorations layer (sorted by row for proper overlap) */}
      {[...tiles]
        .filter(({ col, row }) => decoGrid[col]?.[row])
        .map(({ col, row }) => {
          const { cx, cy } = plotTileCenter(col, row);
          return <DecoSprite key={`d-${col}-${row}`} type={decoGrid[col][row]} cx={cx} cy={cy} />;
        })}

      {/* Plants layer */}
      {plantedGoals
        .slice()
        .sort((a, b) => a.tileRow - b.tileRow)
        .map((goal) => {
          const { cx, cy } = plotTileCenter(goal.tileCol, goal.tileRow);
          return (
            <TilePlant
              key={`p-${goal.id}`}
              plantId={goal.plantType}
              stage={goal.stage}
              healthState={window.getPlantHealth ? window.getPlantHealth(goal).state : "healthy"}
              cx={cx}
              cy={cy}
              onClick={() => onTilePlantClick(goal.id)}
              isSelected={selectedGoalId === goal.id}
            />
          );
        })}
    </svg>
  );
}

// ── Wheel of Life (moved into garden tab) ───────────────────────────────────
// Shows TWO overlays:
//   • Priorities — what the user wants to invest in (the editable budget)
//   • Current   — what their actual tasks/routines/goals show they're investing in
function computeCurrentWheel(goals) {
  // Per-area score 0..10 derived from real activity in that area's goals.
  // Signals (each contributes up to 10, then we average across goals):
  //   • task completion ratio          (0..10)
  //   • routine signal: completedToday adds 6, streak (capped at 14) maps 0..14 → 0..4
  //   • plant stage progress           (0..10)
  // If a goal has zero items, it counts as 0 (no investment yet).
  const out = {};
  WHEEL_AREAS.forEach((a) => {
    const areaGoals = (goals || []).filter((g) => g.area === a.key);
    if (areaGoals.length === 0) {
      out[a.key] = 0;
      return;
    }
    let total = 0;
    areaGoals.forEach((g) => {
      const tasks = g.tasks || [];
      const routines = g.routines || [];
      const taskScore = tasks.length
        ? (tasks.filter((t) => t.completed).length / tasks.length) * 10
        : null;
      const routineScore = routines.length
        ? routines.reduce((acc, r) => {
            const today = r.completedToday ? 6 : 0;
            const streak = (Math.min(14, r.streak || 0) / 14) * 4;
            return acc + today + streak;
          }, 0) / routines.length
        : null;
      const stageScore = ((g.stage || 0) / 4) * 10;
      const parts = [taskScore, routineScore, stageScore].filter((v) => v !== null);
      const goalScore = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;
      total += goalScore;
    });
    out[a.key] = Math.max(0, Math.min(10, total / areaGoals.length));
  });
  return out;
}

function WheelOfLife({ values, goals, slots }) {
  const cx = 130,
    cy = 130,
    maxR = 92,
    n = WHEEL_AREAS.length;
  function spoke(i) {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { cos: Math.cos(a), sin: Math.sin(a) };
  }
  const MAX_PER_AREA = 10;

  // Current-state values are derived (not editable). Priority values come from props.
  const current = React.useMemo(() => computeCurrentWheel(goals), [goals]);
  // Slot usage per area — folded into the axis labels alongside current/priority
  // so the "current line" carries the live used/quota readout.
  const slotMap =
    slots || (window.getAreaSlots ? window.getAreaSlots({ wheelOfLife: values, goals }) : {});

  // Build polygon points for an arbitrary scoring function (key -> 0..10).
  const polyPoints = (getVal) =>
    WHEEL_AREAS.map((a, i) => {
      const { cos, sin } = spoke(i);
      const r = (getVal(a.key) / MAX_PER_AREA) * maxR;
      return `${cx + cos * r},${cy + sin * r}`;
    }).join(" ");

  const PRIORITY_COLOR = "#3A6647"; // deep green (aspiration)
  const CURRENT_COLOR = "#F0A500"; // amber (today's reality)

  return (
    <div>
      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 14,
          marginBottom: 6,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 14,
              height: 8,
              background: CURRENT_COLOR,
              opacity: 0.55,
              borderRadius: 2,
              border: `1.5px solid ${CURRENT_COLOR}`,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1C2B20" }}>Current</span>
          <span style={{ fontSize: 10, color: "#9EB09E" }}>slots filled</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 14,
              height: 8,
              background: "transparent",
              borderRadius: 2,
              border: `1.5px dashed ${PRIORITY_COLOR}`,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1C2B20" }}>Priorities</span>
          <span style={{ fontSize: 10, color: "#9EB09E" }}>slot capacity</span>
        </div>
      </div>

      <svg
        width="260"
        height="260"
        viewBox="0 0 260 260"
        style={{ display: "block", margin: "0 auto" }}
      >
        {/* concentric grid */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((s) => (
          <polygon
            key={s}
            points={WHEEL_AREAS.map((_, i) => {
              const { cos, sin } = spoke(i);
              return `${cx + cos * maxR * s},${cy + sin * maxR * s}`;
            }).join(" ")}
            fill="none"
            stroke="#E8EDE5"
            strokeWidth={s === 1 ? 1.5 : 1}
          />
        ))}
        {WHEEL_AREAS.map((_, i) => {
          const { cos, sin } = spoke(i);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + cos * maxR}
              y2={cy + sin * maxR}
              stroke="#E8EDE5"
              strokeWidth="1.5"
            />
          );
        })}

        {/* CURRENT polygon — slots used per area (the lived reality:
            how many goal slots are actually filled vs. allotted). */}
        <polygon
          points={polyPoints((k) => slotMap[k]?.used || 0)}
          fill={CURRENT_COLOR}
          fillOpacity="0.28"
          stroke={CURRENT_COLOR}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {WHEEL_AREAS.map((a, i) => {
          const { cos, sin } = spoke(i);
          const r = ((slotMap[a.key]?.used || 0) / MAX_PER_AREA) * maxR;
          return (
            <circle
              key={`cur-${a.key}`}
              cx={cx + cos * r}
              cy={cy + sin * r}
              r="3.5"
              fill={CURRENT_COLOR}
              stroke="white"
              strokeWidth="1.5"
            />
          );
        })}

        {/* PRIORITIES polygon — dashed outline (the aspiration) */}
        <polygon
          points={polyPoints((k) => values[k] || 0)}
          fill="none"
          stroke={PRIORITY_COLOR}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeDasharray="5 4"
        />
        {WHEEL_AREAS.map((a, i) => {
          const { cos, sin } = spoke(i);
          const r = ((values[a.key] || 0) / MAX_PER_AREA) * maxR;
          return (
            <circle
              key={`pri-${a.key}`}
              cx={cx + cos * r}
              cy={cy + sin * r}
              r="4"
              fill="white"
              stroke={PRIORITY_COLOR}
              strokeWidth="2"
            />
          );
        })}

        {/* Axis labels — show the area, the live slot usage (used/quota),
            and the priority weight. The slot count IS the current-line value. */}
        {WHEEL_AREAS.map((a, i) => {
          const { cos, sin } = spoke(i);
          const lx = cx + cos * (maxR + 26),
            ly = cy + sin * (maxR + 26);
          const pri = values[a.key] || 0;
          const s = slotMap[a.key] || { used: 0, quota: pri, locked: pri === 0 };
          return (
            <g key={a.key}>
              <circle cx={lx} cy={ly} r="20" fill={a.color} opacity="0.15" />
              <text x={lx} y={ly - 5} textAnchor="middle" fontSize="11">
                {a.icon}
              </text>
              <text
                x={lx}
                y={ly + 7}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#5A6A5A"
              >
                {a.label}
              </text>
              <text
                x={lx}
                y={ly + 18}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fontVariantNumeric="tabular-nums"
              >
                {s.locked ? (
                  <tspan fill="#9EB09E">🔒</tspan>
                ) : (
                  <React.Fragment>
                    <tspan fill={CURRENT_COLOR}>{s.used}</tspan>
                    <tspan fill="#C8D0C8">/</tspan>
                    <tspan fill={PRIORITY_COLOR}>{s.quota}</tspan>
                  </React.Fragment>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Tile Action Drawer ──────────────────────────────────────────────────────
// Opens when user taps a tile. Lets them plant a seed OR buy/place a deco.
function TileActionDrawer({
  goals,
  decoCatalog,
  owned,
  shopCoins,
  dispatch,
  mode,
  onClose,
  onPlantSeed,
  onPlaceDeco,
  onPickDeco,
}) {
  // mode: { kind:'tile', col, row } | { kind:'cart' }
  // For 'tile' mode, the zone of the tile decides which tab is available:
  //   • planting rows → seeds only
  //   • grass rows    → decorations only
  // 'cart' mode shows both (user picks an item, then picks a tile in the matching zone).
  const tileIsPlantingZone = mode.kind === "tile" && isPlantingRow(mode.row);
  const tileIsGrassZone = mode.kind === "tile" && isGrassRow(mode.row);
  const lockedTab = tileIsPlantingZone ? "seeds" : tileIsGrassZone ? "decos" : null;

  const unplanted = goals.filter((g) => !g.planted);
  const [tab, setTab] = React.useState(lockedTab || (unplanted.length > 0 ? "seeds" : "decos"));

  React.useEffect(() => {
    if (lockedTab) setTab(lockedTab);
    else setTab(unplanted.length > 0 ? "seeds" : "decos");
    /* eslint-disable-next-line */
  }, []);

  const title =
    mode.kind === "tile"
      ? tileIsPlantingZone
        ? "Plant a seed here"
        : "Decorate this tile"
      : "Add to garden";
  const subtitle =
    mode.kind === "tile"
      ? tileIsPlantingZone
        ? "This tile is in your planting bed — pick a seed"
        : "This tile is on the lawn — pick a decoration"
      : "Pick something — then choose where to place it";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "18px 18px 28px",
          width: "100%",
          boxSizing: "border-box",
          maxHeight: "78%",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            background: "#E0E0E0",
            borderRadius: 2,
            margin: "0 auto 14px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#1C2B20" }}>{title}</div>
            <div style={{ fontSize: 12, color: "#9EB09E", marginTop: 2 }}>{subtitle}</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "#FFF8EC",
              padding: "5px 11px",
              borderRadius: 18,
              border: "1px solid #FFE0B2",
            }}
          >
            <span style={{ fontSize: 13 }}>🪙</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#F0A500" }}>{shopCoins}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            background: "#E8EDE5",
            borderRadius: 12,
            padding: 3,
            gap: 2,
            marginBottom: 14,
            ...(lockedTab ? { display: "none" } : {}),
          }}
        >
          <button
            onClick={() => setTab("seeds")}
            style={{
              flex: 1,
              padding: "7px 0",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: tab === "seeds" ? "#fff" : "transparent",
              color: tab === "seeds" ? "#1C2B20" : "#7A8A7A",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            🌰 Seeds {unplanted.length > 0 ? `(${unplanted.length})` : ""}
          </button>
          <button
            onClick={() => setTab("decos")}
            style={{
              flex: 1,
              padding: "7px 0",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: tab === "decos" ? "#fff" : "transparent",
              color: tab === "decos" ? "#1C2B20" : "#7A8A7A",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            🛒 Decorations
          </button>
        </div>

        {tab === "seeds" && (
          <>
            {unplanted.length === 0 ? (
              <div
                style={{
                  padding: "24px 16px",
                  textAlign: "center",
                  color: "#9EB09E",
                  background: "#F8FBF8",
                  borderRadius: 14,
                  border: "1px dashed #C8E6C9",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#3A6647", marginBottom: 6 }}>
                  All seeds planted!
                </div>
                <div style={{ fontSize: 11, marginBottom: 14, lineHeight: 1.5 }}>
                  Every goal you create becomes a seed.
                  <br />
                  Add a new life goal to get another seed to plant.
                </div>
                <button
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("bloomly:navigate", {
                        detail: { tab: "plans", action: "newGoal" },
                      }),
                    );
                    onClose();
                  }}
                  style={{
                    background: "#3A6647",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 18px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  + Create a new goal
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {unplanted.map((g) => {
                  const plantDef = PLANT_DEFS.find((p) => p.id === g.plantType);
                  const area = WHEEL_AREAS.find((a) => a.key === g.area);
                  return (
                    <div
                      key={g.id}
                      onClick={() => onPlantSeed(g.id)}
                      style={{
                        background: "#FFF8E1",
                        borderRadius: 14,
                        padding: "12px 10px",
                        border: "1.5px solid #FFE082",
                        textAlign: "center",
                        cursor: "pointer",
                      }}
                    >
                      <SeedPacket plantDef={plantDef} goalTitle={g.title} />
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#1C2B20",
                          marginTop: 4,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {g.title}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: area?.color || "#9EB09E",
                          margin: "2px 0 8px",
                        }}
                      >
                        {area?.icon} {plantDef?.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#3A6647",
                          background: "#F1F8F1",
                          padding: "4px 0",
                          borderRadius: 8,
                        }}
                      >
                        Free 🌱
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "decos" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {decoCatalog.map((item) => {
              const isOwned = owned.includes(item.id);
              const canAfford = shopCoins >= item.cost;
              const enabled = isOwned || canAfford;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!enabled) return;
                    if (mode.kind === "tile") {
                      if (!isOwned) {
                        // buy + place at tile
                        dispatch({ type: "BUY_DECO", id: item.id });
                      }
                      onPlaceDeco(item.id);
                    } else {
                      // cart mode → pick item, then user picks tile
                      if (!isOwned) dispatch({ type: "BUY_DECO", id: item.id });
                      onPickDeco(item.id);
                    }
                  }}
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${isOwned ? "#C8E6C9" : "#EAEDE8"}`,
                    borderRadius: 14,
                    padding: "12px 10px",
                    cursor: enabled ? "pointer" : "default",
                    opacity: enabled ? 1 : 0.45,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1C2B20" }}>{item.name}</div>
                  <div
                    style={{
                      fontSize: 9,
                      color: RARITY_COLOR[item.rarity],
                      fontWeight: 600,
                      textTransform: "capitalize",
                      marginBottom: 6,
                    }}
                  >
                    {item.rarity}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      justifyContent: "center",
                      color: isOwned ? "#3A6647" : canAfford ? "#F0A500" : "#9EB09E",
                      background: isOwned ? "#F1F8F1" : canAfford ? "#FFF8EC" : "#F5F5F5",
                      padding: "4px 0",
                      borderRadius: 8,
                    }}
                  >
                    {isOwned ? (
                      "✓ Owned · place"
                    ) : (
                      <>
                        <span>🪙</span>
                        {item.cost}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Plant detail modal ────────────────────────────────────────────────────────
function PlantDetailModal({ goal, onClose }) {
  const area = (window.WHEEL_AREAS || []).find((a) => a.key === goal.area);
  const plantDef = (window.PLANT_DEFS || []).find((p) => p.id === goal.plantType);
  const { pct, needed, req } = (
    window.getPlantProgress || (() => ({ pct: 0, needed: {}, req: {} }))
  )(goal);
  const primaryRes = (window.AREA_RESOURCE || {})[goal.area];
  const primaryInfo = (window.RESOURCE_INFO || {})[primaryRes];
  const secondaryRes = plantDef?.secondary;
  const secondaryInfo = (window.RESOURCE_INFO || {})[secondaryRes];
  const stageNames = window.STAGE_NAMES || [];
  const stageColors = window.STAGE_COLORS || [];
  const health = window.getPlantHealth
    ? window.getPlantHealth(goal)
    : { state: "healthy", overdue: 0, lapsed: 0 };
  const healthInfo = (window.HEALTH_STATE_INFO || {})[health.state] || {};
  const isDead = health.state === "dead";
  const isUnhealthy = health.state !== "healthy";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 36px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            background: "#E0E0E0",
            borderRadius: 2,
            margin: "0 auto 18px",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          {window.PlantSprite && (
            <PlantSprite
              plantId={goal.plantType}
              stage={goal.stage}
              size={76}
              healthState={health.state}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1C2B20", marginBottom: 3 }}>
              {plantDef?.name || goal.plantType}
            </div>
            <div
              style={{
                fontSize: 12,
                color: area?.color || "#3A6647",
                fontWeight: 600,
                marginBottom: 5,
              }}
            >
              {area?.icon} {goal.title}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: stageColors[goal.stage] || "#9EB09E",
                  background: (stageColors[goal.stage] || "#ccc") + "22",
                  padding: "3px 9px",
                  borderRadius: 8,
                }}
              >
                {stageNames[goal.stage]}
              </span>
              {isUnhealthy && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: healthInfo.color,
                    background: healthInfo.bg,
                    padding: "3px 9px",
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>{healthInfo.icon}</span>
                  <span>{healthInfo.label}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        {isUnhealthy && (
          <div
            style={{
              padding: "10px 12px",
              background: healthInfo.bg,
              border: `1px solid ${healthInfo.color}33`,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: healthInfo.color,
                marginBottom: 3,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{healthInfo.icon}</span>
              <span>{healthInfo.message}</span>
            </div>
            <div style={{ fontSize: 11, color: "#5A6A5A" }}>
              {health.overdue > 0 && (
                <span>
                  {health.overdue} overdue task{health.overdue === 1 ? "" : "s"}
                </span>
              )}
              {health.overdue > 0 && health.lapsed > 0 && <span> · </span>}
              {health.lapsed > 0 && (
                <span>
                  {health.lapsed} lapsed routine{health.lapsed === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>
        )}
        {isDead ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>💀</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#5A5A5A" }}>
              This plant has died
            </div>
            <div style={{ fontSize: 13, color: "#9A9A9A", marginTop: 4, marginBottom: 14 }}>
              Catch up on overdue tasks to revive, or replant from the goal page.
            </div>
          </div>
        ) : goal.stage < 4 ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1C2B20", marginBottom: 10 }}>
              Growing to {stageNames[goal.stage + 1]}
            </div>
            {req &&
              Object.entries(req).map(([res, amt]) => {
                const ri = (window.RESOURCE_INFO || {})[res];
                const have = Math.min(goal.plantRes?.[res] || 0, amt);
                return (
                  <div key={res} style={{ marginBottom: 10 }}>
                    <div
                      style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: ri?.color }}>
                        {ri?.icon} {ri?.label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: ri?.color }}>
                        {have.toFixed(0)}/{amt}
                      </span>
                    </div>
                    <div style={{ height: 7, background: ri?.bg || "#F5F5F5", borderRadius: 4 }}>
                      <div
                        style={{
                          height: "100%",
                          background: ri?.color,
                          borderRadius: 4,
                          width: `${(have / amt) * 100}%`,
                          transition: "width .4s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            <div
              style={{
                padding: "10px 14px",
                background: "#F8FBF8",
                borderRadius: 12,
                border: "1px solid #E8EDE5",
                marginTop: 6,
              }}
            >
              <div style={{ fontSize: 11, color: "#7A8A7A", marginBottom: 2 }}>How to grow:</div>
              <div style={{ fontSize: 12, color: "#5A6A5A" }}>
                Tasks → {primaryInfo?.icon} +4 {primaryInfo?.label}
                <br />
                Routines → {primaryInfo?.icon} +2 + {secondaryInfo?.icon} +2 {secondaryInfo?.label}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>✨</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#3A6647" }}>Fully Blooming!</div>
            <div style={{ fontSize: 13, color: "#9EB09E", marginTop: 4 }}>
              This plant has reached its full potential.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Garden Card (embeddable) ─────────────────────────────────────────────
function GardenCard({ state, dispatch }) {
  const [view, setView] = React.useState("garden");
  const [drawer, setDrawer] = React.useState(null);
  const [placingDeco, setPlacingDeco] = React.useState(null);
  const [placingGoalId, setPlacingGoalId] = React.useState(null);
  const [selectedGoalId, setSelectedGoalId] = React.useState(null);

  const selectedGoal = state.goals.find((g) => g.id === selectedGoalId);
  const totalDecos = (state.garden.decoGrid || []).flat().filter(Boolean).length;
  const plantedCount = state.goals.filter((g) => g.planted).length;

  React.useEffect(() => {
    window.GardenTab_startPlanting = (goalId) => {
      if (state.goals.some((g) => g.id === goalId && !g.planted)) {
        setView("garden");
        setPlacingGoalId(goalId);
      }
    };
    return () => {
      delete window.GardenTab_startPlanting;
    };
  }, [state.goals]);

  function handleTileClick(col, row, type) {
    if (type === "plant" && placingGoalId) {
      // Seeds may only be planted in the tilled rows (bottom zone)
      if (!isPlantingRow(row)) return;
      dispatch({ type: "PLANT_GOAL", goalId: placingGoalId, col, row });
      setPlacingGoalId(null);
    } else if (type === "deco" && placingDeco) {
      // Decorations may only be placed on grass (top zone)
      if (!isGrassRow(row)) return;
      if (state.garden.decoGrid[col]?.[row]) return;
      dispatch({ type: "PLACE_DECO", col, row, item: placingDeco });
      setPlacingDeco(null);
    }
  }
  function handleEmptyTileTap(col, row) {
    if (placingGoalId || placingDeco) return;
    setDrawer({ kind: "tile", col, row });
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1.5px solid #EAEDE8",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 14px 10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1C2B20" }}>
              {view === "garden" ? "My Garden" : "Life Compass"}
            </div>
            <div style={{ fontSize: 11, color: "#9EB09E" }}>
              {view === "garden"
                ? `${plantedCount} plants · ${totalDecos} decorations`
                : "Priorities vs. what you actually have"}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "#FFF8EC",
              padding: "5px 11px",
              borderRadius: 18,
              border: "1px solid #FFE0B2",
            }}
          >
            <span style={{ fontSize: 13 }}>🪙</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#F0A500" }}>
              {state.shopCoins}
            </span>
          </div>
        </div>
        <div
          style={{ display: "flex", background: "#E8EDE5", borderRadius: 12, padding: 3, gap: 2 }}
        >
          {[
            { id: "garden", label: "🌿 Garden" },
            { id: "wheel", label: "🎯 Wheel of life" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                flex: 1,
                padding: "6px 0",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                background: view === v.id ? "#fff" : "transparent",
                color: view === v.id ? "#1C2B20" : "#7A8A7A",
                fontWeight: 700,
                fontSize: 12,
                boxShadow: view === v.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === "garden" ? (
        <div style={{ padding: "0 0 12px" }}>
          {(placingGoalId || placingDeco) && (
            <div
              style={{
                margin: "0 10px 8px",
                padding: "9px 12px",
                background: "#3A6647",
                borderRadius: 12,
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                {placingGoalId
                  ? "🌱 Tap a soil tile (bottom rows) to plant your seed"
                  : "🏡 Tap a grass tile (top rows) to place " +
                    DECO_CATALOG.find((c) => c.id === placingDeco)?.name}
              </span>
              <button
                onClick={() => {
                  setPlacingGoalId(null);
                  setPlacingDeco(null);
                }}
                style={{
                  background: "rgba(255,255,255,0.22)",
                  border: "none",
                  color: "white",
                  borderRadius: 8,
                  padding: "4px 9px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "inherit",
                }}
              >
                ✕
              </button>
            </div>
          )}
          <div
            style={{
              margin: "0 10px",
              borderRadius: 16,
              overflow: "hidden",
              border: "1.5px solid #C8E6C9",
              position: "relative",
            }}
          >
            <IsometricGarden
              goals={state.goals}
              decoGrid={state.garden.decoGrid}
              onTilePlantClick={(id) => setSelectedGoalId((prev) => (prev === id ? null : id))}
              onDecoTileClick={(col, row, type) => {
                if (placingGoalId || placingDeco) handleTileClick(col, row, type);
                else handleEmptyTileTap(col, row);
              }}
              placingGoalId={placingGoalId}
              placingDeco={placingDeco}
              selectedGoalId={selectedGoalId}
            />
            <button
              onClick={() => setDrawer({ kind: "cart" })}
              style={{
                position: "absolute",
                bottom: 10,
                left: 10,
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#fff",
                border: "1.5px solid #EAEDE8",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 19,
                padding: 0,
              }}
              aria-label="Open shop"
            >
              🛒
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "4px 12px 14px" }}>
          <WheelOfLife values={state.wheelOfLife} goals={state.goals} />
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              background: "#F8FBF8",
              borderRadius: 12,
              border: "1px solid #E8EDE5",
            }}
          >
            <div style={{ fontSize: 11, color: "#5A6A5A", lineHeight: 1.5 }}>
              <b style={{ color: "#3A6647" }}>Priorities</b> are what you want — locked in when you
              set up your account.
              <b style={{ color: "#F0A500" }}> Current</b> is what you actually have, computed from
              your tasks, routines and goal progress. The gap between them shows where to focus
              next.
            </div>
          </div>
        </div>
      )}

      {selectedGoal && (
        <PlantDetailModal goal={selectedGoal} onClose={() => setSelectedGoalId(null)} />
      )}

      {drawer && (
        <TileActionDrawer
          goals={state.goals}
          decoCatalog={DECO_CATALOG}
          owned={state.garden.owned || []}
          shopCoins={state.shopCoins}
          dispatch={dispatch}
          mode={drawer}
          onClose={() => setDrawer(null)}
          onPlantSeed={(goalId) => {
            if (drawer.kind === "tile") {
              dispatch({ type: "PLANT_GOAL", goalId, col: drawer.col, row: drawer.row });
              setDrawer(null);
            } else {
              setPlacingGoalId(goalId);
              setDrawer(null);
            }
          }}
          onPlaceDeco={(decoId) => {
            dispatch({ type: "PLACE_DECO", col: drawer.col, row: drawer.row, item: decoId });
            setDrawer(null);
          }}
          onPickDeco={(decoId) => {
            setPlacingDeco(decoId);
            setDrawer(null);
          }}
        />
      )}
    </div>
  );
}

Object.assign(window, { GardenCard, DECO_CATALOG });
