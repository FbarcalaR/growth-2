export const RESOURCE_KEYS = [
  "water",
  "sunlight",
  "gold",
  "love",
  "nutrients",
  "magic",
  "moonlight",
] as const;

export type Resource = (typeof RESOURCE_KEYS)[number];

export const RESOURCE_META: Record<Resource, { label: string; icon: string }> = {
  water: { label: "Water", icon: "💧" },
  sunlight: { label: "Sunlight", icon: "☀️" },
  gold: { label: "Gold", icon: "🪙" },
  love: { label: "Love", icon: "🌸" },
  nutrients: { label: "Nutrients", icon: "🌿" },
  magic: { label: "Magic", icon: "✨" },
  moonlight: { label: "Moonlight", icon: "🌙" },
};
