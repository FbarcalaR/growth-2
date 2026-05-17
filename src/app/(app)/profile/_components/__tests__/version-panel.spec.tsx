// @vitest-environment jsdom
import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchSpy = vi.fn();
const originalSha = process.env.NEXT_PUBLIC_BUILD_SHA;

beforeEach(() => {
  fetchSpy.mockReset();
  vi.stubGlobal("fetch", fetchSpy);
  // Pretend this bundle was built on Vercel with a known SHA so the
  // "skip when dev" branch doesn't short-circuit the comparison.
  process.env.NEXT_PUBLIC_BUILD_SHA = "abc1234567";
  // Re-import the module on every test so the module-level BUILD_SHA
  // constant picks up our stubbed env var.
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env.NEXT_PUBLIC_BUILD_SHA = originalSha;
});

function versionResponse(sha: string): Response {
  return new Response(JSON.stringify({ sha }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function renderPanel() {
  const mod = await import("../version-panel");
  return render(<mod.VersionPanel />);
}

describe("<VersionPanel />", () => {
  it("renders the first 7 chars of the bundled SHA", async () => {
    const { getByText } = await renderPanel();
    expect(getByText("abc1234")).toBeTruthy();
  });

  it("shows 'up to date' when the server SHA matches the bundled SHA", async () => {
    fetchSpy.mockResolvedValue(versionResponse("abc1234567"));
    const { getByRole, findByText } = await renderPanel();
    fireEvent.click(getByRole("button", { name: /check for updates/i }));
    await findByText(/on the latest version/i);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith("/api/version", expect.anything()));
  });

  it("surfaces a refresh CTA when the server SHA differs", async () => {
    fetchSpy.mockResolvedValue(versionResponse("def9876543"));
    const { getByRole, findByText } = await renderPanel();
    fireEvent.click(getByRole("button", { name: /check for updates/i }));
    await findByText(/new version is available/i);
    expect(getByRole("button", { name: /refresh to update/i })).toBeTruthy();
  });

  it("reloads the page when the refresh CTA is clicked", async () => {
    fetchSpy.mockResolvedValue(versionResponse("def9876543"));
    const reloadSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload: reloadSpy },
    });

    const { getByRole, findByRole } = await renderPanel();
    fireEvent.click(getByRole("button", { name: /check for updates/i }));
    const refresh = await findByRole("button", { name: /refresh to update/i });
    fireEvent.click(refresh);
    expect(reloadSpy).toHaveBeenCalled();
  });

  it("reports a friendly error when the request fails", async () => {
    fetchSpy.mockRejectedValue(new Error("network down"));
    const { getByRole, findByText } = await renderPanel();
    fireEvent.click(getByRole("button", { name: /check for updates/i }));
    await findByText(/network down/i);
  });
});
