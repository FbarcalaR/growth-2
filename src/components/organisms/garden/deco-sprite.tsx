// Top-down per-deco sprite. Used inside `<IsometricGarden>` for tiles in the deco zone.

import type { ReactNode } from "react";

export type DecoId =
  | "stone_path"
  | "fence"
  | "bench"
  | "lantern"
  | "birdbath"
  | "windmill"
  | "arch"
  | "koi_pond"
  | "fountain"
  | "pagoda";

type DecoSpriteProps = {
  type: DecoId;
  cx: number;
  cy: number;
};

export function DecoSprite({ type, cx, cy }: DecoSpriteProps) {
  const x = cx - 12;
  const y = cy - 14;
  const common = (children: ReactNode) => (
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
