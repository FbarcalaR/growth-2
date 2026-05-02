// @vitest-environment jsdom
import { fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SetPrioritiesModal } from "../set-priorities-modal";
import { setupFetchMock } from "@/test/fetch-mock";
import { freshUser } from "@/test/fixtures/state";
import { renderWithQuery } from "@/test/render";

/**
 * Story 1.2 integration test. Mounts the real `SetPrioritiesModal` against
 * a mocked `/api/me` and `/api/me/priorities`, drives the budget steppers,
 * and asserts the lock + the not-dismissable behaviour.
 */

const onLocked = vi.fn();

beforeEach(() => {
  onLocked.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setupAuthed(user: Awaited<ReturnType<typeof freshUser>>) {
  const fetch = setupFetchMock();
  fetch.json("/api/me", user);
  return fetch;
}

describe("<SetPrioritiesModal />", () => {
  it("renders the title, description, and the budget pill at 30 by default", async () => {
    const user = await freshUser("Ada");
    setupAuthed(user);

    const { findByRole } = renderWithQuery(<SetPrioritiesModal open onLocked={onLocked} />);
    await findByRole("dialog", { name: /set your priorities/i });

    expect((await findByRole("dialog")).textContent).toContain("30 points");
    // Save button copy reflects "Allocate 30 more points" while remaining > 0
    expect(
      (await findByRole("button", { name: /allocate 30 more/i })).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("clicking + on an area increments and decrements the remaining budget", async () => {
    const user = await freshUser("Ada");
    setupAuthed(user);

    const { findAllByRole, findByRole } = renderWithQuery(
      <SetPrioritiesModal open onLocked={onLocked} />,
    );
    await findByRole("dialog");
    const incrementButtons = await findAllByRole("button", { name: /increase/i });
    fireEvent.click(incrementButtons[0]!); // +1 to Health

    // Budget pill drops to 29 (lookup again because re-render).
    await waitFor(async () => {
      expect(
        (await findByRole("button", { name: /allocate 29 more/i })).hasAttribute("disabled"),
      ).toBe(true);
    });
  });

  it("the + button is disabled once the budget is fully allocated", async () => {
    const user = await freshUser("Ada");
    setupAuthed(user);

    const { findAllByRole, findByRole, getAllByRole } = renderWithQuery(
      <SetPrioritiesModal open onLocked={onLocked} initial={{ health: 29 }} />,
    );
    await findByRole("dialog");
    // 1 point left; pressing + on Health (already 29) lifts to 30 = exhausted.
    const incrementButtons = await findAllByRole("button", { name: /increase health/i });
    fireEvent.click(incrementButtons[0]!);

    await waitFor(() => {
      const allIncrementButtons = getAllByRole("button", { name: /increase/i });
      expect(allIncrementButtons.every((b) => b.hasAttribute("disabled"))).toBe(true);
    });
  });

  it("when the budget hits zero the save button becomes the lock CTA", async () => {
    const user = await freshUser("Ada");
    setupAuthed(user);

    const initial = { health: 30 } as const;
    const { findByRole } = renderWithQuery(
      <SetPrioritiesModal open onLocked={onLocked} initial={initial} />,
    );
    const save = await findByRole("button", { name: /save and lock my priorities/i });
    expect(save.hasAttribute("disabled")).toBe(false);
  });

  it("submitting calls PATCH /api/me/priorities and fires onLocked with the values", async () => {
    const user = await freshUser("Ada");
    const fetch = setupAuthed(user);
    const lockedUser = {
      ...user,
      prioritiesLocked: true,
      wheelOfLife: { ...user.wheelOfLife, health: 30 },
    };
    fetch.mock("/api/me/priorities", { method: "PATCH", status: 200, body: lockedUser });

    const { findByRole } = renderWithQuery(
      <SetPrioritiesModal open onLocked={onLocked} initial={{ health: 30 }} />,
    );
    fireEvent.click(await findByRole("button", { name: /save and lock my priorities/i }));

    await waitFor(() => expect(onLocked).toHaveBeenCalledTimes(1));
    const calls = fetch.calls("PATCH", "/api/me/priorities");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.body).toEqual({
      values: {
        health: 30,
        career: 0,
        finances: 0,
        relationships: 0,
        personal: 0,
        fun: 0,
        spirituality: 0,
      },
    });
  });

  it("a server-side 409 (already locked) surfaces inline; onLocked is not called", async () => {
    const user = await freshUser("Ada");
    const fetch = setupAuthed(user);
    fetch.mock("/api/me/priorities", {
      method: "PATCH",
      status: 409,
      body: { code: "PRIORITIES_ALREADY_LOCKED", message: "PRIORITIES_ALREADY_LOCKED" },
    });

    const { findByRole, findByText } = renderWithQuery(
      <SetPrioritiesModal open onLocked={onLocked} initial={{ health: 30 }} />,
    );
    fireEvent.click(await findByRole("button", { name: /save and lock my priorities/i }));

    await findByText(/priorities_already_locked/i);
    expect(onLocked).not.toHaveBeenCalled();
  });

  it("the modal is non-dismissable: pressing Escape does not close it (no onClose to call)", async () => {
    const user = await freshUser("Ada");
    setupAuthed(user);

    const { findByRole } = renderWithQuery(<SetPrioritiesModal open onLocked={onLocked} />);
    const dialog = await findByRole("dialog");

    fireEvent.keyDown(window, { key: "Escape" });
    // The dialog is still in the DOM.
    expect(dialog.isConnected).toBe(true);
  });
});
