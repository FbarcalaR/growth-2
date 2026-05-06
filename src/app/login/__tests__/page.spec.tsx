// @vitest-environment jsdom
import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const signInMock = vi.fn().mockResolvedValue(undefined);
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import LoginPage from "../page";
import { renderWithQuery } from "@/test/render";

beforeEach(() => {
  signInMock.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/login — Google OAuth flow", () => {
  it("renders the welcome copy and a single 'Continue with Google' CTA", async () => {
    const { findByRole, getByText } = renderWithQuery(<LoginPage />);
    await findByRole("button", { name: /continue with google/i });
    getByText(/grow your best life/i);
  });

  it("clicking the CTA invokes Auth.js signIn with the google provider + /today callback", async () => {
    const { findByRole } = renderWithQuery(<LoginPage />);
    const cta = await findByRole("button", { name: /continue with google/i });
    fireEvent.click(cta);
    expect(signInMock).toHaveBeenCalledWith("google", { callbackUrl: "/today" });
  });
});
