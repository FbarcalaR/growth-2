// @vitest-environment jsdom
import { afterEach, describe, it, vi } from "vitest";

import TodayPage from "../page";
import { setupFetchMock } from "@/test/fetch-mock";
import { freshUser, lockedUser, seededGoals } from "@/test/fixtures/state";
import { renderWithQuery } from "@/test/render";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/today", () => {
  it("shows the empty state when no goals have items today", async () => {
    const user = await lockedUser();
    setupFetchMock({
      "/api/me": user,
      "/api/today": { groups: [] },
    });

    const { findByText } = renderWithQuery(<TodayPage />);
    await findByText(/nothing for today/i);
    await findByText(/when you have tasks or routines/i);
  });

  it("renders the user's name in the greeting and the coin/streak chips", async () => {
    const user = await freshUser("Ada");
    setupFetchMock({
      "/api/me": { ...user, shopCoins: 42, streak: 3 },
      "/api/today": { groups: [] },
    });

    const { findByRole, findByText } = renderWithQuery(<TodayPage />);
    await findByRole("heading", { level: 1, name: /ada/i });
    // Coin & streak appear in their pill spans.
    await findByText("42");
    await findByText("3d");
  });

  it("renders one group per goal with its tasks and routines", async () => {
    const { user, goals } = await seededGoals([
      { title: "Run a 5K", area: "health" },
      { title: "Read 12 books", area: "personal" },
    ]);

    // Add an undated task to the first goal, and a daily routine to the second,
    // so both have visible items. We do this via the today endpoint mock so we
    // don't have to wire CREATE_TASK here — we control the response shape.
    const goalA = goals[0]!;
    const goalB = goals[1]!;
    setupFetchMock({
      "/api/me": user,
      "/api/today": {
        groups: [
          {
            goalId: goalA.id,
            goalTitle: goalA.title,
            goalArea: goalA.area,
            goalPlantType: goalA.plantType,
            goalStage: goalA.stage,
            goalHealth: 100,
            goalHealthState: "healthy",
            tasks: [{ id: "t1", title: "Buy shoes", completed: false, dueDate: null }],
            routines: [],
          },
          {
            goalId: goalB.id,
            goalTitle: goalB.title,
            goalArea: goalB.area,
            goalPlantType: goalB.plantType,
            goalStage: goalB.stage,
            goalHealth: 100,
            goalHealthState: "healthy",
            tasks: [],
            routines: [
              {
                id: "r1",
                title: "Read 30 minutes",
                completedToday: false,
                streak: 4,
                repeatDays: [true, true, true, true, true, true, true],
              },
            ],
          },
        ],
      },
    });

    const { findByText } = renderWithQuery(<TodayPage />);
    await findByText("Run a 5K");
    await findByText("Read 12 books");
    await findByText("Buy shoes");
    await findByText("Read 30 minutes");
    // Streak label from RoutineRow
    await findByText(/4-day streak/);
  });

  it("shows the progress summary with totals when items are present", async () => {
    const user = await lockedUser();
    setupFetchMock({
      "/api/me": user,
      "/api/today": {
        groups: [
          {
            goalId: "g1",
            goalTitle: "Goal A",
            goalArea: "health",
            goalPlantType: "herb",
            goalStage: 1,
            goalHealth: 100,
            goalHealthState: "healthy",
            tasks: [
              { id: "t1", title: "Done already", completed: true, dueDate: null },
              { id: "t2", title: "Pending", completed: false, dueDate: null },
            ],
            routines: [],
          },
        ],
      },
    });

    const { findByText } = renderWithQuery(<TodayPage />);
    await findByText(/today.s plan/i);
    await findByText(/1\/2 complete/);
  });
});
