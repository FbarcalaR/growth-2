export const HEALTH_STATES = ["healthy", "wilting", "ill", "critical", "dead"] as const;

export type HealthState = (typeof HEALTH_STATES)[number];

export const HEALTH_META: Record<HealthState, { label: string; icon: string; copy: string }> = {
  healthy: { label: "Healthy", icon: "🌿", copy: "Thriving" },
  wilting: {
    label: "Wilting",
    icon: "🥀",
    copy: "A task is overdue — catch up to perk it back up",
  },
  ill: {
    label: "Unwell",
    icon: "😷",
    copy: "Multiple tasks overdue — your plant is struggling",
  },
  critical: {
    label: "Critical",
    icon: "⚠️",
    copy: "On the brink — finish a task today to save it",
  },
  dead: { label: "Dead", icon: "💀", copy: "Your plant withered. Replant or drop the goal." },
};
