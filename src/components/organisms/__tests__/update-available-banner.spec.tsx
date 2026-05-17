// @vitest-environment jsdom
import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UpdateAvailableBanner } from "../update-available-banner";

const fetchSpy = vi.fn();

beforeEach(() => {
  fetchSpy.mockReset();
  vi.stubGlobal("fetch", fetchSpy);
  window.localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function versionResponse(sha: string): Response {
  return new Response(JSON.stringify({ sha }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("<UpdateAvailableBanner />", () => {
  it("stays hidden when /api/version returns the same SHA across polls", async () => {
    fetchSpy.mockResolvedValue(versionResponse("abc123"));
    const { queryByRole } = render(<UpdateAvailableBanner />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    await vi.advanceTimersByTimeAsync(5 * 60_000 + 1);
    expect(queryByRole("dialog", { name: /new version/i })).toBeNull();
  });

  it("shows the banner when a later poll returns a different SHA", async () => {
    // First call → baseline. All subsequent calls → new SHA.
    fetchSpy
      .mockResolvedValueOnce(versionResponse("abc123"))
      .mockResolvedValue(versionResponse("def456"));

    const { findByRole } = render(<UpdateAvailableBanner />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    // Advance past one poll interval so the next fetch fires.
    await vi.advanceTimersByTimeAsync(5 * 60_000 + 1);
    await findByRole("dialog", { name: /new version/i });
  });

  it("dismisses on the X button and stores the SHA in localStorage", async () => {
    fetchSpy
      .mockResolvedValueOnce(versionResponse("abc123"))
      .mockResolvedValue(versionResponse("def456"));

    const { findByRole, getByRole, queryByRole } = render(<UpdateAvailableBanner />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(5 * 60_000 + 1);
    await findByRole("dialog", { name: /new version/i });

    fireEvent.click(getByRole("button", { name: /dismiss update prompt/i }));

    expect(queryByRole("dialog", { name: /new version/i })).toBeNull();
    expect(window.localStorage.getItem("growth.update.dismissed-sha")).toBe("def456");
  });

  it("doesn't re-show the banner for a SHA the user already dismissed", async () => {
    window.localStorage.setItem("growth.update.dismissed-sha", "def456");
    fetchSpy
      .mockResolvedValueOnce(versionResponse("abc123"))
      .mockResolvedValue(versionResponse("def456"));

    const { queryByRole } = render(<UpdateAvailableBanner />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(5 * 60_000 + 1);
    // Give the second fetch a tick to resolve.
    await vi.advanceTimersByTimeAsync(10);
    expect(queryByRole("dialog", { name: /new version/i })).toBeNull();
  });
});
