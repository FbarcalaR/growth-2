export const AREA_KEYS = [
  "health",
  "career",
  "finances",
  "relationships",
  "personal",
  "fun",
  "spirituality",
] as const;

export type Area = (typeof AREA_KEYS)[number];

export const AREA_META: Record<Area, { label: string; icon: string }> = {
  health: { label: "Health", icon: "💪" },
  career: { label: "Career", icon: "💼" },
  finances: { label: "Finances", icon: "💰" },
  relationships: { label: "Relations", icon: "❤️" },
  personal: { label: "Growth", icon: "✨" },
  fun: { label: "Fun", icon: "🎉" },
  spirituality: { label: "Purpose", icon: "🌙" },
};
