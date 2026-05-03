/**
 * Central query-key factory. Every query key in the app starts here so we can
 * grep for usage and invalidate consistently.
 */
export const queryKeys = {
  me: () => ["me"] as const,
  goals: () => ["goals"] as const,
  goal: (id: string) => ["goals", id] as const,
  garden: () => ["garden"] as const,
  shop: () => ["shop"] as const,
  today: () => ["today"] as const,
  history: (month: string) => ["history", month] as const,
};
