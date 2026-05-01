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

/**
 * One-line description of each life area, surfaced in the Set-Priorities flow
 * (and any later "what is this area?" disclosure). Lifted from the prototype's
 * onboarding copy.
 */
export const AREA_DESCRIPTION: Record<Area, string> = {
  health: "Physical and mental wellbeing — sleep, exercise, nutrition, energy.",
  career: "Work, learning, and professional growth — the things you build during the day.",
  finances: "Money — earning, saving, investing, and feeling secure with what you have.",
  relationships: "Family, friends, partner — the people you want to show up for.",
  personal: "Personal growth — hobbies, skills, and becoming who you want to be.",
  fun: "Play, leisure, and joy — what recharges you outside of duty.",
  spirituality:
    "Meaning and purpose — values, reflection, faith, or connection to something bigger.",
};
