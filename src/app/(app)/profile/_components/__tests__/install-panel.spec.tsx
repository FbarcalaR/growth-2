// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InstallPanel } from "../install-panel";

const originalUserAgent = navigator.userAgent;

afterEach(() => {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: originalUserAgent,
  });
});

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
  queueMicrotask(() => resolveChoice({ outcome: "accepted" }));
  act(() => {
    window.dispatchEvent(event);
  });
  return { prompt, userChoice };
}

describe("<InstallPanel />", () => {
  it("disables the button with a hint when no install event has fired", () => {
    const { getByRole, getByText } = render(<InstallPanel />);
    const btn = getByRole("button", { name: /install app/i });
    expect(btn).toHaveProperty("disabled", true);
    expect(getByText(/install isn't available right now/i)).toBeTruthy();
  });

  it("enables the button once beforeinstallprompt fires", () => {
    const { getByRole } = render(<InstallPanel />);
    fireBeforeInstall();
    const btn = getByRole("button", { name: /install app/i });
    expect(btn).toHaveProperty("disabled", false);
  });

  it("calls the captured prompt() and switches to 'Installed' on accept", async () => {
    const { getByRole, findByText } = render(<InstallPanel />);
    const { prompt } = fireBeforeInstall();
    await act(async () => {
      fireEvent.click(getByRole("button", { name: /install app/i }));
    });
    expect(prompt).toHaveBeenCalledTimes(1);
    await findByText(/growth is installed on this device/i);
    expect(getByRole("button", { name: /installed/i })).toHaveProperty("disabled", true);
  });

  it("shows the Share → Add to Home Screen instructions on iOS", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    const { getByRole, getByText } = render(<InstallPanel />);
    expect(getByText(/tap the share icon/i)).toBeTruthy();
    expect(getByRole("button", { name: /install app/i })).toHaveProperty("disabled", true);
  });

  it("flips to 'Installed' when the browser fires appinstalled", () => {
    const { getByRole, findByText } = render(<InstallPanel />);
    fireBeforeInstall();
    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(getByRole("button", { name: /installed/i })).toHaveProperty("disabled", true);
    return findByText(/growth is installed on this device/i);
  });
});
