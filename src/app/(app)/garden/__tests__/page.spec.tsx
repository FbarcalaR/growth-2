// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import GardenPage from "../page";
import { setupFetchMock } from "@/test/fetch-mock";
import { makeGoalDto } from "@/test/fixtures/dto";
import { freshUser, lockedUser, seededGoals } from "@/test/fixtures/state";
import { renderWithQuery } from "@/test/render";

vi.mock("next/navigation", () => ({
  usePathname: () => "/garden",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), back: vi.fn() }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/garden", () => {
  it("shows the empty state when the user has no goals", async () => {
    const user = await freshUser("Ada");
    setupFetchMock({
      "/api/me": user,
      "/api/goals": { goals: [] },
    });
    const { findByText } = renderWithQuery(<GardenPage />);
    await findByText(/plant your first goal/i);
  });

  it("renders one card per goal under 'Life Goals'", async () => {
    const { user, goals } = await seededGoals([
      { title: "Run a 5K", area: "health" },
      { title: "Read 12 books", area: "personal" },
    ]);
    setupFetchMock({
      "/api/me": user,
      "/api/goals": { goals },
    });
    const { findByText, findByRole } = renderWithQuery(<GardenPage />);
    await findByRole("heading", { level: 1, name: /life goals/i });
    await findByText("Run a 5K");
    await findByText("Read 12 books");
  });

  it("groups completed / fully bloomed goals under their own heading", async () => {
    const user = await lockedUser();
    setupFetchMock({
      "/api/me": user,
      "/api/goals": {
        goals: [
          makeGoalDto({
            id: "g1",
            title: "Active Goal",
            stage: 1,
            planted: true,
            tileCol: 0,
            tileRow: 4,
          }),
          makeGoalDto({
            id: "g2",
            title: "Bloomed Out",
            area: "career",
            plantType: "money_tree",
            stage: 4,
            planted: true,
            tileCol: 1,
            tileRow: 4,
          }),
        ],
      },
    });
    const { findByText, findByRole } = renderWithQuery(<GardenPage />);
    await findByText("Active Goal");
    await findByRole("heading", { level: 2, name: /blooming.*completed/i });
    await findByText("Bloomed Out");
  });

  it("opens the GoalEditor when the New button is clicked and posts on save", async () => {
    const user = await freshUser("Ada");
    const fm = setupFetchMock({
      "/api/me": user,
      "/api/goals": { goals: [] },
    });
    fm.json("/api/goals", makeGoalDto(), "POST");

    const { findByRole, getByPlaceholderText } = renderWithQuery(<GardenPage />);
    fireEvent.click(await findByRole("button", { name: /^new$/i }));
    fireEvent.change(getByPlaceholderText(/run a 5k/i), { target: { value: "Run a 5K" } });
    fireEvent.click(await findByRole("radio", { name: /health/i }));
    fireEvent.click(await findByRole("button", { name: /plant goal/i }));

    await waitFor(() => expect(fm.calls("POST", "/api/goals")).toHaveLength(1));
    expect(fm.calls("POST", "/api/goals")[0]!.body).toEqual({
      title: "Run a 5K",
      area: "health",
      plantType: "herb",
    });
  });
});
