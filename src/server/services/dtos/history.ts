import type { HistoryDay, HistoryItem, HistoryMonth } from "../history-service";
import type { HistoryDayDto, HistoryItemDto, HistoryResponse } from "@/shared/schemas/history";

/** Domain `HistoryItem` → wire `HistoryItemDto`. */
function historyItemToDto(item: HistoryItem): HistoryItemDto {
  return {
    kind: item.kind,
    itemId: item.itemId,
    goalId: item.goalId,
    goalTitle: item.goalTitle,
    goalArea: item.goalArea,
    title: item.title,
  };
}

/** Domain `HistoryDay` → wire `HistoryDayDto`. */
function historyDayToDto(day: HistoryDay): HistoryDayDto {
  return {
    date: day.date,
    completed: day.completed.map(historyItemToDto),
    missed: day.missed.map(historyItemToDto),
    planned: day.planned.map(historyItemToDto),
  };
}

/** Domain `HistoryMonth` → wire `HistoryResponse`. */
export function historyMonthToDto(month: HistoryMonth): HistoryResponse {
  return {
    month: month.month,
    days: month.days.map(historyDayToDto),
    summary: { ...month.summary },
  };
}
