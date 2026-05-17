// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InstallPrompt } from "../install-prompt";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

/** Fire a synthetic `beforeinstallprompt` carrying the spy hooks Chrome uses. */
function fireBeforeInstall(): {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
} {
  const prompt = vi.fn().mockResolvedValue(undefined);
  let resolveChoice!: (v: { outcome: "accepted" | "dismissed" }) => void;
  const userChoice = new Promise<{ outcome: "accepted" | "dismissed" }>((r) => {
    resolveChoice = r;
  });
  const event = new Event("beforeinstallprompt") as Event & {
    prompt: typeof prompt;
    userChoice: typeof userChoice;
  };
  event.prompt = prompt;
  event.userChoice = userChoice;
  // Resolve immediately as accepted unless the test overrides; gives us a
  // simple default for the happy path.
  queueMicrotask(() => resolveChoice({ outcome: "accepted" }));
  act(() => {
    window.dispatchEvent(event);
  });
  return { prompt, userChoice };
}

describe("<InstallPrompt />", () => {
  it("stays hidden until the browser fires beforeinstallprompt", () => {
    const { queryByRole } = render(<InstallPrompt />);
    expect(queryByRole("dialog")).toBeNull();
  });

  it("renders the banner + Install button when beforeinstallprompt fires", () => {
    const { queryByRole, getByRole } = render(<InstallPrompt />);
    fireBeforeInstall();
    expect(queryByRole("dialog")).not.toBeNull();
    expect(getByRole("button", { name: /^install$/i })).toBeTruthy();
  });

  it("Install click calls the captured prompt() and hides the banner on accept", async () => {
    const { getByRole, queryByRole } = render(<InstallPrompt />);
    const { prompt } = fireBeforeInstall();

    await act(async () => {
      fireEvent.click(getByRole("button", { name: /^install$/i }));
    });

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(queryByRole("dialog")).toBeNull();
  });

  it("Dismiss click stores a timestamp in localStorage and hides the banner", () => {
    const { getByRole, queryByRole } = render(<InstallPrompt />);
    fireBeforeInstall();

    fireEvent.click(getByRole("button", { name: /not now/i }));
    expect(queryByRole("dialog")).toBeNull();
    const stored = window.localStorage.getItem("growth.install.dismissed");
    expect(stored).not.toBeNull();
    expect(Number(stored)).toBeGreaterThan(0);
  });

  it("stays hidden when a recent dismissal exists in localStorage", () => {
    window.localStorage.setItem("growth.install.dismissed", String(Date.now()));
    const { queryByRole } = render(<InstallPrompt />);
    fireBeforeInstall();
    expect(queryByRole("dialog")).toBeNull();
  });

  it("re-shows after the cooldown window passes", () => {
    const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem("growth.install.dismissed", String(fifteenDaysAgo));
    const { queryByRole } = render(<InstallPrompt />);
    fireBeforeInstall();
    expect(queryByRole("dialog")).not.toBeNull();
  });
});
