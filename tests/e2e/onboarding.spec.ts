import { expect, test } from "@playwright/test";

/**
 * First golden e2e flow. Originally drove the two-step welcome → name UI
 * (Stories 1.1–1.3); Epic B replaced `/login` with a single "Continue with
 * Google" CTA that the e2e harness can't follow (it'd need a real Google
 * consent screen).
 *
 * We still get end-to-end coverage of the priorities + landing flow by
 * using the **dev-stub session path** the test environment leaves open:
 * `requireUser()` reads the Auth.js JWT session in production but falls
 * back to the dev-stub cookie when `NODE_ENV !== "production"` (see
 * `src/server/auth/require-user.ts`). Playwright boots `pnpm dev`, so
 * we're in non-production; a single `POST /api/me` mints the cookie and
 * we're authenticated.
 *
 * Each test gets a fresh user via a unique random name so the in-memory
 * backend doesn't carry state across tests.
 */
test.describe("first-run onboarding", () => {
  test("sign in via dev-stub → set priorities → land on /today", async ({ page }) => {
    const name = `Reviewer ${crypto.randomUUID().slice(0, 8)}`;

    // 1. Mint a dev session by posting to /api/me. Use the *page's* request
    //    context, not the top-level `request` fixture — the latter has its
    //    own cookie jar and the Set-Cookie response wouldn't reach the
    //    browser navigation below.
    const signInRes = await page.request.post("/api/me", { data: { name } });
    expect(signInRes.status()).toBe(201);

    // 2. Visit /today. The (app) shell sees the dev-stub session, so we
    //    don't bounce back to /login.
    await page.goto("/today");
    await page.waitForURL("**/today");

    // 3. Priorities modal is overlaid because the user hasn't locked the
    //    wheel yet.
    const dialog = page.getByRole("dialog", { name: /set your priorities/i });
    await expect(dialog).toBeVisible();

    // 4. Spend the full 30-point budget on Health (deterministic).
    const incrementHealth = dialog.getByRole("button", { name: /increase health/i });
    for (let i = 0; i < 30; i += 1) {
      await incrementHealth.click();
    }

    // 5. The save CTA flips enabled at remaining=0.
    const lockButton = dialog.getByRole("button", { name: /save and lock my priorities/i });
    await expect(lockButton).toBeEnabled();

    // 6. Lock; modal disappears and Today renders the greeting with the
    //    user's name.
    await lockButton.click();
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole("heading", { level: 1, name: new RegExp(name, "i") }),
    ).toBeVisible();
  });
});
