import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config. Boots `pnpm dev` automatically when running locally
 * or in CI; tests hit a real browser against a real Next.js process backed by
 * the in-memory backend.
 *
 * Single golden flow today (`tests/e2e/onboarding.spec.ts`); add per-flow
 * specs as Epic 2+ ship surfaces worth covering end-to-end.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // The in-memory backend is process-singleton; serialise to avoid cross-test bleed.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Use a separate port from `pnpm dev`'s default 3000 so a developer can
    // have the dev server running and still execute `pnpm test:e2e`.
    command: "pnpm dev -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
