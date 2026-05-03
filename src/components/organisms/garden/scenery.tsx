// Pixel-art scenery layer ported from `garden-tab.jsx`.

import { PLOT_H, PLOT_PX, PLOT_PY, PLOT_TILE, PLOT_W, SVG_H, SVG_W, TILE } from "./geometry";
import { GroundTile, type GroundType } from "./ground-tile";

type ScenerySpriteType =
  | "tree_pine"
  | "tree_round"
  | "rock"
  | "rock_small"
  | "flower_bush"
  | "grass_tuft"
  | "signpost"
  | "well";

type ScenerySpriteProps = {
  x: number;
  y: number;
  type: ScenerySpriteType;
  scale?: number;
};

const SCENE_LAYOUT: readonly string[] = [
  "gggggggggggggg",
  "GGgggggggggggg",
  "gggggggppppppg",
  "gggggggggggppg",
  "gggggggggggppg",
  "gggggggggggppg",
  "gggggggggggppg",
  "gggggggggggppg",
  "gGggggggggggpg",
  "GGgggggssswwwg",
  "gggggssswwwwwg",
];

type SceneDecor = {
  x: number;
  y: number;
  type: ScenerySpriteType;
  scale: number;
};

const SCENE_DECOR: readonly SceneDecor[] = [
  { x: 0.3, y: 0.2, type: "tree_pine", scale: 1.0 },
  { x: 1.5, y: 0.6, type: "tree_round", scale: 0.9 },
  { x: 0.8, y: 1.4, type: "tree_pine", scale: 0.8 },
  { x: 11.4, y: 0.4, type: "tree_round", scale: 1.0 },
  { x: 12.6, y: 1.5, type: "tree_pine", scale: 0.95 },
  { x: 0.2, y: 8.4, type: "tree_round", scale: 0.95 },
  { x: 1.6, y: 9.6, type: "tree_pine", scale: 0.85 },
  { x: 12.7, y: 7.6, type: "tree_round", scale: 0.9 },
  { x: 1.0, y: 5.0, type: "rock", scale: 0.8 },
  { x: 0.6, y: 7.2, type: "rock_small", scale: 0.9 },
  { x: 12.4, y: 4.0, type: "rock_small", scale: 1.0 },
  { x: 12.8, y: 9.4, type: "flower_bush", scale: 1.0 },
  { x: 0.4, y: 3.4, type: "flower_bush", scale: 0.9 },
  { x: 12.4, y: 5.5, type: "flower_bush", scale: 0.9 },
  { x: 3.5, y: 9.0, type: "grass_tuft", scale: 1 },
  { x: 5.0, y: 9.4, type: "grass_tuft", scale: 1 },
  { x: 8.0, y: 0.4, type: "grass_tuft", scale: 1 },
  { x: 6.0, y: 1.4, type: "grass_tuft", scale: 1 },
  { x: 9.5, y: 9.5, type: "grass_tuft", scale: 1 },
  { x: 1.5, y: 2.2, type: "signpost", scale: 1 },
  { x: 10.4, y: 8.0, type: "well", scale: 1 },
];

function ScenerySprite({ x, y, type, scale = 1 }: ScenerySpriteProps) {
  const px = x * TILE;
  const py = y * TILE;
  const s = scale;

  switch (type) {
    case "tree_pine":
      return (
        <g
          shapeRendering="crispEdges"
          transform={`translate(${px},${py})`}
          style={{ pointerEvents: "none" }}
        >
          <ellipse cx={20 * s} cy={42 * s} rx={14 * s} ry={4 * s} fill="rgba(0,0,0,0.25)" />
          <rect x={16 * s} y={32 * s} width={8 * s} height={12 * s} fill="#5B3A21" />
          <rect x={16 * s} y={32 * s} width={3 * s} height={12 * s} fill="#3F2715" />
          <rect x={6 * s} y={20 * s} width={28 * s} height={14 * s} fill="#2F6B2C" />
          <rect x={4 * s} y={22 * s} width={2 * s} height={10 * s} fill="#1F4F1E" />
          <rect x={34 * s} y={22 * s} width={2 * s} height={10 * s} fill="#1F4F1E" />
          <rect x={9 * s} y={11 * s} width={22 * s} height={12 * s} fill="#3A8B36" />
          <rect x={7 * s} y={13 * s} width={2 * s} height={9 * s} fill="#2F6B2C" />
          <rect x={31 * s} y={13 * s} width={2 * s} height={9 * s} fill="#2F6B2C" />
          <rect x={12 * s} y={4 * s} width={16 * s} height={9 * s} fill="#4FA64A" />
          <rect x={10 * s} y={6 * s} width={2 * s} height={6 * s} fill="#3A8B36" />
          <rect x={28 * s} y={6 * s} width={2 * s} height={6 * s} fill="#3A8B36" />
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
          <rect x={4 * s} y={14 * s} width={32 * s} height={16 * s} fill="#3A8B36" />
          <rect x={2 * s} y={18 * s} width={2 * s} height={10 * s} fill="#2F6B2C" />
          <rect x={36 * s} y={18 * s} width={2 * s} height={10 * s} fill="#2F6B2C" />
          <rect x={4 * s} y={12 * s} width={4 * s} height={2 * s} fill="#3A8B36" />
          <rect x={32 * s} y={12 * s} width={4 * s} height={2 * s} fill="#3A8B36" />
          <rect x={8 * s} y={6 * s} width={24 * s} height={8 * s} fill="#4FA64A" />
          <rect x={6 * s} y={8 * s} width={2 * s} height={5 * s} fill="#3A8B36" />
          <rect x={32 * s} y={8 * s} width={2 * s} height={5 * s} fill="#3A8B36" />
          <rect x={12 * s} y={2 * s} width={16 * s} height={5 * s} fill="#5FB75A" />
          <rect x={12 * s} y={5 * s} width={4 * s} height={3 * s} fill="#85D578" opacity="0.95" />
          <rect x={10 * s} y={11 * s} width={3 * s} height={3 * s} fill="#7BCB6F" opacity="0.85" />
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
          <rect x={4 * s} y={12 * s} width={20 * s} height={12 * s} fill="#3A8B36" />
          <rect x={2 * s} y={14 * s} width={2 * s} height={8 * s} fill="#2F6B2C" />
          <rect x={24 * s} y={14 * s} width={2 * s} height={8 * s} fill="#2F6B2C" />
          <rect x={4 * s} y={22 * s} width={20 * s} height={2 * s} fill="#1F4F1E" />
          <rect x={6 * s} y={8 * s} width={16 * s} height={6 * s} fill="#4FA64A" />
          <rect x={8 * s} y={6 * s} width={12 * s} height={4 * s} fill="#5FB75A" />
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
          <rect x={4 * s} y={20 * s} width={28 * s} height={14 * s} fill="#9D9D95" />
          <rect x={4 * s} y={20 * s} width={28 * s} height={2 * s} fill="#C2C2BB" />
          <rect x={4 * s} y={32 * s} width={28 * s} height={2 * s} fill="#5C5C55" />
          {[6, 12, 18, 24].map((xx) => (
            <rect key={xx} x={xx * s} y={22 * s} width={1 * s} height={10 * s} fill="#5C5C55" />
          ))}
          <rect x={8 * s} y={22 * s} width={20 * s} height={9 * s} fill="#3F8FB8" />
          <rect x={8 * s} y={22 * s} width={20 * s} height={2 * s} fill="#5BB1D8" />
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

function FarmFence() {
  const fx = PLOT_PX - 6;
  const fy = PLOT_PY - 6;
  const fw = PLOT_W + 12;
  const fh = PLOT_H + 12;
  const posts: Array<{ x: number; y: number }> = [];
  const POST_GAP = 28;
  for (let x = fx; x <= fx + fw; x += POST_GAP) posts.push({ x, y: fy });
  for (let x = fx; x <= fx + fw; x += POST_GAP) posts.push({ x, y: fy + fh - 4 });
  for (let y = fy + POST_GAP; y < fy + fh - 4; y += POST_GAP) posts.push({ x: fx, y });
  for (let y = fy + POST_GAP; y < fy + fh - 4; y += POST_GAP) posts.push({ x: fx + fw - 4, y });
  return (
    <g shapeRendering="crispEdges" style={{ pointerEvents: "none" }}>
      <rect x={fx} y={fy} width={fw} height={3} fill="#7A4F2C" />
      <rect x={fx} y={fy + 3} width={fw} height={1} fill="#5B3A21" />
      <rect x={fx} y={fy + fh - 4} width={fw} height={3} fill="#7A4F2C" />
      <rect x={fx} y={fy + fh - 1} width={fw} height={1} fill="#5B3A21" />
      <rect x={fx} y={fy} width={3} height={fh} fill="#7A4F2C" />
      <rect x={fx + 3} y={fy} width={1} height={fh} fill="#5B3A21" />
      <rect x={fx + fw - 4} y={fy} width={3} height={fh} fill="#7A4F2C" />
      <rect x={fx + fw - 1} y={fy} width={1} height={fh} fill="#5B3A21" />
      {posts.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y - 3} width={4} height={9} fill="#9C6B3F" />
          <rect x={p.x} y={p.y - 3} width={1} height={9} fill="#5B3A21" />
          <rect x={p.x + 3} y={p.y - 3} width={1} height={9} fill="#5B3A21" />
        </g>
      ))}
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

export function FarmScenery() {
  const rows = SCENE_LAYOUT;
  return (
    <g style={{ pointerEvents: "none" }}>
      <rect width={SVG_W} height={SVG_H} fill="#5FA73F" />
      {rows.map((row, r) =>
        [...row].map((ch, c) => {
          const type = (ch ?? "g") as GroundType;
          return <GroundTile key={`${c}-${r}`} x={c * TILE} y={r * TILE} type={type} />;
        }),
      )}
      <FarmFence />
      {SCENE_DECOR.map((d, i) => (
        <ScenerySprite key={i} x={d.x} y={d.y} type={d.type} scale={d.scale} />
      ))}
    </g>
  );
}
