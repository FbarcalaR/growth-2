// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";

import { useSession } from "@/client/hooks";
import { useGoals } from "@/client/hooks";
import { waitFor } from "@testing-library/react";

import { setupFetchMock } from "../fetch-mock";
import { freshUser, lockedUser, seededGoals } from "../fixtures/state";
import { renderWithQuery } from "../render";

/**
 * Smoke test for the test harness. Demonstrates the canonical pattern that
 * future feature tests will follow:
 *
 *  1. Build state via fixtures (real services → DTOs).
 *  2. Wire fetch-mock with the DTOs as response bodies.
 *  3. Render the component with `renderWithQuery`.
 *  4. Assert on rendered output and on the fetch spy.
 */

afterEach(() => {
  // Each test uses its own setupFetchMock(); restore unstubs the global.
});

describe("test harness", () => {
  describe("fixtures", () => {
    it("freshUser returns a UserDto with prioritiesLocked=false and no goals state to assert", async () => {
      const user = await freshUser();
      expect(user.id).toMatch(/^user_/);
      expect(user.name).toBe("Ada");
      expect(user.prioritiesLocked).toBe(false);
      expect(user.shopCoins).toBe(0);
    });

    it("lockedUser returns a user with prioritiesLocked=true and the wheel set", async () => {
      const user = await lockedUser();
      expect(user.prioritiesLocked).toBe(true);
      expect(user.wheelOfLife.health).toBe(5);
    });

    it("seededGoals returns user + goals + garden, with the first goal planted", async () => {
      const { user, goals, garden } = await seededGoals();
      expect(user.prioritiesLocked).toBe(true);
      expect(goals).toHaveLength(3);
      expect(goals[0]?.planted).toBe(true);
      expect(goals[0]?.area).toBe("health");
      expect(goals[0]?.healthState).toBe("healthy");
      expect(garden.decoGrid[1]?.[4]).toEqual({ kind: "plant", goalId: goals[0]?.id });
    });

    it("seededGoals accepts a custom list", async () => {
      const { goals } = await seededGoals([{ title: "Try this", area: "fun" }]);
      expect(goals).toHaveLength(1);
      expect(goals[0]?.area).toBe("fun");
      expect(goals[0]?.planted).toBe(false);
    });
  });

  describe("renderWithQuery + fetch-mock", () => {
    it("end-to-end: fixtures → fetch-mock → useSession() resolves to the seeded user", async () => {
      const user = await lockedUser();
      const fetch = setupFetchMock();
      fetch.json("/api/me", user);

      function Probe() {
        const session = useSession();
        if (!session.user) return <span>Loading or signed out</span>;
        return <span>Hello {session.user.name}</span>;
      }

      const { findByText } = renderWithQuery(<Probe />);
      await findByText(`Hello ${user.name}`);

      expect(fetch.calls("GET", "/api/me")).toHaveLength(1);
      fetch.restore();
    });

    it("useGoals reads the cached list once /api/goals resolves", async () => {
      const { user, goals } = await seededGoals();
      const fetch = setupFetchMock();
      fetch.json("/api/me", user);
      fetch.json("/api/goals", { goals });

      function Probe() {
        const q = useGoals();
        if (q.isPending) return <span>loading</span>;
        return <span>{q.data?.length ?? 0} goals</span>;
      }

      const { container } = renderWithQuery(<Probe />);
      await waitFor(() => expect(container.textContent).toBe(`${goals.length} goals`));

      expect(fetch.calls("GET", "/api/goals")).toHaveLength(1);
      fetch.restore();
    });
  });
});
