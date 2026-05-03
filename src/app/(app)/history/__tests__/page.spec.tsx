// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import HistoryPage from "../page";
import { setupFetchMock } from "@/test/fetch-mock";
import { renderWithQuery } from "@/test/render";
import type { HistoryDayDto, HistoryResponse } from "@/shared/schemas/history";

vi.mock("next/navigation", () => ({
  usePathname: () => "/history",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function emptyDays(month: string): HistoryDayDto[] {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(y!, m!, 0).getDate();
  const days: HistoryDayDto[] = [];
  for (let d = 1; d <= last; d += 1) {
    days.push({
      date: `${month}-${String(d).padStart(2, "0")}`,
      completed: [],
      missed: [],
      planned: [],
    });
  }
  return days;
}

function buildResponse(overrides: Partial<HistoryResponse> = {}): HistoryResponse {
  const month = overrides.month ?? currentMonth();
  return {
    month,
    days: overrides.days ?? emptyDays(month),
    summary: overrides.summary ?? {
      perfectDays: 0,
      missedDays: 0,
      monthPct: 0,
      completedThisMonth: 0,
      scheduledThisMonth: 0,
      currentStreak: 0,
    },
  };
}

describe("/history", () => {
  it("renders the month grid + summary + day-detail panel for the current month", async () => {
    const month = currentMonth();
    setupFetchMock({
      [`/api/history?month=${month}`]: buildResponse({
        summary: {
          perfectDays: 3,
          missedDays: 1,
          monthPct: 0.75,
          completedThisMonth: 9,
          scheduledThisMonth: 12,
          currentStreak: 0,
        },
      }),
    });

    const { findByText, findAllByRole } = renderWithQuery(<HistoryPage />);
    // Summary card
    await findByText("75%");
    // Day buttons (1 per day in month)
    const dayButtons = await findAllByRole("button", { name: /open \d{4}-\d{2}-\d{2}/i });
    expect(dayButtons.length).toBeGreaterThanOrEqual(28);
    // Day-detail panel renders for today by default
    const today = todayIso();
    const todayLabel = new Date(`${today}T00:00:00`).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    await findByText(todayLabel);
  });

  it("shows a streak pill when currentStreak > 0", async () => {
    const month = currentMonth();
    setupFetchMock({
      [`/api/history?month=${month}`]: buildResponse({
        summary: {
          perfectDays: 5,
          missedDays: 0,
          monthPct: 1,
          completedThisMonth: 10,
          scheduledThisMonth: 10,
          currentStreak: 5,
        },
      }),
    });

    const { findByText } = renderWithQuery(<HistoryPage />);
    await findByText(/5-day streak/);
  });

  it("navigates to the previous month when the user taps ‹", async () => {
    const month = currentMonth();
    const prevMonth = (() => {
      const [y, m] = month.split("-").map(Number);
      const d = new Date(y!, m! - 2, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })();
    const fm = setupFetchMock();
    fm.mock(`/api/history?month=${month}`, { status: 200, body: buildResponse({ month }) });
    fm.mock(`/api/history?month=${prevMonth}`, {
      status: 200,
      body: buildResponse({ month: prevMonth }),
    });

    const { findByRole } = renderWithQuery(<HistoryPage />);
    fireEvent.click(await findByRole("button", { name: /previous month/i }));

    await waitFor(() => expect(fm.calls("GET", `/api/history?month=${prevMonth}`)).toHaveLength(1));
  });
});
