import { z } from "zod";

import { AREA_KEYS } from "@/shared/areas";

const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const MonthSchema = z.string().regex(/^\d{4}-\d{2}$/, "Expected YYYY-MM");

export const HistoryItemKindSchema = z.enum(["task", "routine", "goal"]);
export type HistoryItemKind = z.infer<typeof HistoryItemKindSchema>;

/**
 * One row inside a day-detail panel. Carries enough surface for the row to
 * render without a second round-trip (goal title + area chip + item title).
 */
export const HistoryItemDtoSchema = z.object({
  kind: HistoryItemKindSchema,
  /** TaskId | RoutineId; `null` for goal completions (the goal itself was completed). */
  itemId: z.string().nullable(),
  goalId: z.string(),
  goalTitle: z.string(),
  goalArea: z.enum(AREA_KEYS),
  /** Snapshot title at the time of completion. For `missed` items, the live title. */
  title: z.string(),
});

export type HistoryItemDto = z.infer<typeof HistoryItemDtoSchema>;

/**
 * Per-day rollup. The page renders 38px bubbles whose visual state derives
 * from `(scheduled, completed, planned)`:
 *   • past + scheduled === 0           → empty/quiet day
 *   • past + completed === scheduled   → perfect ✓
 *   • past + completed === 0           → missed ✕
 *   • today                            → planned non-empty + progress disc
 *   • future                           → dashed outline + planned-count badge
 */
export const HistoryDayDtoSchema = z.object({
  date: ISODateSchema,
  completed: z.array(HistoryItemDtoSchema),
  missed: z.array(HistoryItemDtoSchema),
  planned: z.array(HistoryItemDtoSchema),
});

export type HistoryDayDto = z.infer<typeof HistoryDayDtoSchema>;

export const HistorySummaryDtoSchema = z.object({
  /** Past days inside the queried month with `completed === scheduled > 0`. */
  perfectDays: z.number().int().min(0),
  /** Past days inside the queried month with `scheduled > 0 && completed === 0`. */
  missedDays: z.number().int().min(0),
  /** 0..1, completed/scheduled across all past days inside the month. */
  monthPct: z.number().min(0).max(1),
  /** Sum of completed events across past days inside the month. */
  completedThisMonth: z.number().int().min(0),
  /** Sum of scheduled items across past days inside the month. */
  scheduledThisMonth: z.number().int().min(0),
  /**
   * Consecutive past days ending at (today − 1) where every scheduled item was
   * completed. Today is excluded because it's still in flight.
   */
  currentStreak: z.number().int().min(0),
});

export type HistorySummaryDto = z.infer<typeof HistorySummaryDtoSchema>;

export const HistoryResponseSchema = z.object({
  month: MonthSchema,
  days: z.array(HistoryDayDtoSchema),
  summary: HistorySummaryDtoSchema,
});

export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;

export const HistoryQuerySchema = z.object({
  month: MonthSchema,
});

export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;
