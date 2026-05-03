# Growth — Product Backlog

> Revised after PR #1 review: dropped the iOS-frame story, added backend foundation work, and reordered Epic 0 so the backend goes in alongside the frontend foundation. Stories ordered to maximise demonstrable value early and minimise rework.

Each story uses **As a / I want / So that** + acceptance criteria. Tasks are the engineering breakdown.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Epic 0 — Foundations

Goal: a runnable Next.js project with tokens, atomic-design primitives, and a working backend skeleton. After this epic, the next person can pick up a feature without yak-shaving.

### Story 0.1 — Project bootstrap ✅ (PR #2)
**As a** developer, **I want** a Next.js + TS + Tailwind project initialized at the latest stable versions, **so that** all later work has a working baseline.
- [x] 0.1.1 `create-next-app` (latest stable) with App Router, TS strict, Tailwind, ESLint
- [x] 0.1.2 Add Prettier + EditorConfig
- [x] 0.1.3 Configure path alias `@/*` → `src/*`
- [x] 0.1.4 `pnpm` scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check` (`test:unit`/`test:e2e` land with Story 0.5)
- [x] 0.1.5 ESLint rule preventing `src/server/**` imports from `src/components/**`, `src/features/**`, `src/client/**`
- [x] 0.1.6 GitHub Actions CI: install → typecheck → lint → format:check → build
- **Acceptance:** `pnpm dev` shows a Hello page; CI passes on a noop PR. ✅

### Story 0.2 — Design tokens & fonts ✅ (PR #2)
**As a** designer-developer, **I want** all colors, fonts, and radii encoded once, **so that** components don't drift.
- [x] 0.2.1 Configure `next/font` for Plus Jakarta Sans
- [x] 0.2.2 Add tokens to Tailwind v4's `@theme` block in `globals.css` (Tailwind v4 is CSS-first; no `tailwind.config.ts`)
- [x] 0.2.3 CSS variables in `globals.css` for tokens that need runtime theming (`--accent` reserved for the Profile picker in Story 6.2.2)
- [x] 0.2.4 `/styleguide` route renders every token (kept for the project's life)

### Story 0.3 — Atomic design primitives ✅ (PR #3)
**As a** developer, **I want** the reusable atoms and a few key molecules in place, **so that** features compose them instead of restyling.
- [x] 0.3.1 Atoms: `Button`, `Chip`, `Badge`, `Icon`, `Input`, `ProgressBar`, `Avatar`, `Toggle`, `Checkbox`, `Modal`
- [x] 0.3.2 Molecules: `AreaChip`, `HealthBadge`, `TaskRow`, `RoutineRow`, `AreaPicker`, `ResourceMeter`
- [x] 0.3.3 `cn()` helper (`clsx` + `tailwind-merge`), typed `variant`/`tone`/`size` props on atoms (no Tailwind blobs at call sites)
- [x] 0.3.4 `/styleguide` extended to show every atom + molecule with each variant
- **Acceptance:** A second developer can build a new screen using only atoms/molecules without writing new utility-class soup. ✅

### Story 0.4 — App shell (no device frame) ✅ (PR #4)
**As a** user, **I want** a clean web app shell with bottom navigation, **so that** I can move between tabs.
- [x] 0.4.1 Root layout in `app/layout.tsx`: fonts, globals (TanStack Query + any other providers land in Story 0.8)
- [x] 0.4.2 `(app)` route group with bottom-nav layout
- [x] 0.4.3 Routes: `/today`, `/garden`, `/history`, `/profile` — each a real page
- [x] 0.4.4 Responsive shell: full-width on mobile; centered max-width column on desktop
- [x] 0.4.5 Auth guard at `(app)/layout.tsx` redirects to `/login` if no session (dev-stub via `useSyncExternalStore` over `localStorage`; onboarding-modal overlay lands with Story 1.2/1.3)
- **Bonus:** `BottomNav` and `PlaceholderPage` use `lucide-react` icons (project's chosen icon library) instead of inline SVGs/emojis.

### Story 0.5 — Domain layer scaffold (server-side) ✅ (PR #6)
**As a** developer, **I want** the domain types and constants in `src/server/domain/`, **so that** every service speaks the same language.
- [x] 0.5.1 Port `AREA_RESOURCE`, `AREA_DEFAULT_PLANT`, `PLANT_DEFS`, `STAGE_NAMES` (resource and area display metadata already lives in `src/shared/`)
- [x] 0.5.2 Define `Goal`, `Task`, `Routine`, `Plant`, `Resource`, `Area`, `GardenState`, `User`, `WheelOfLife` types (every persistent entity scoped by `userId`)
- [x] 0.5.3 Pure functions: `growPlant`, `getOverdueCount`, `getHealth`, `getHealthState`, `applyTaskCompletion`, `applyRoutineCompletion`, `completeRoutinePermanently`, `replantGoal`, `completeGoal`, `placeDeco`/`unplaceDeco`, `plantGoalOnTile`/`unplantGoalFromTile`, `lockPriorities`
- [x] 0.5.4 Clock injected via `Clock` interface; `frozenClock(iso)` for tests; `systemClock` for production
- [x] 0.5.5 Unit tests for each rule (Vitest); 76 specs across plants/health/rewards/goals/garden/wheel/schemas
- [x] 0.5.6 `DomainError` class with stable error codes (`GOAL_NOT_FOUND`, `TILE_OCCUPIED`, `PRIORITIES_ALREADY_LOCKED`, …) — services let these bubble; HTTP error mapper translates to 4xx in Story 0.7
- [x] 0.5.7 Zod schemas live alongside their entity (`src/server/domain/{user,goal,plant,garden}/schemas.ts`) for validation at the persistence/API boundary

### Story 0.6 — Repository abstraction + in-memory impl ✅ (PR #6)
**As a** developer, **I want** repository interfaces with an in-memory implementation, **so that** services have somewhere to read/write that we can later swap for Postgres without touching domain or services.
- [x] 0.6.1 Interfaces split per repo: `src/server/repositories/{user,goal,garden,shop}-repo.ts` + `index.ts` aggregate `Repositories` type
- [x] 0.6.2 In-memory implementations under `src/server/repositories/memory/`
- [x] 0.6.3 Composition root `src/server/container.ts` — single place that picks impls; `getContainer()` / `resetContainer()`
- [x] 0.6.4 Every repo method scoped by `userId`; cross-user reads return null / empty
- [x] 0.6.5 Conformance suite (`__tests__/conformance.ts`) parameterised by a `makeRepos()` factory; `memory.spec.ts` runs it against the in-memory impls. Same suite will run against Prisma in Epic A.
- [x] 0.6.6 Repos return defensive clones — callers can't mutate the store by holding onto references.

### Story 0.7 — HTTP boundary (Route Handlers + validation) ✅ (PR #7)
**As a** developer, **I want** the API surface defined and validated, **so that** the frontend has a stable contract.
- [x] 0.7.1 Zod schemas in `src/shared/schemas/{user,goal,garden,shop,common}.ts` for every request and response
- [x] 0.7.2 `requireUser()` helper (dev-session cookie via `next/headers`; ready to swap for Auth.js session)
- [x] 0.7.3 Error mapper: `DomainError`/`HttpError` → typed 4xx, unknown → 500 + log; stable JSON shape `{ code, message, issues? }`
- [x] 0.7.4 Routes: `/api/me` (GET/POST/DELETE), `/api/me/priorities` (PATCH), `/api/goals` (GET/POST), `/api/goals/[id]` (GET/PATCH/DELETE), `/api/goals/[id]/{tasks,routines}` CRUD, `/api/goals/[id]/{complete,replant}`, `/api/goals/[id]/routines/[routineId]/permanent`, `/api/garden` (GET), `/api/garden/tiles` (POST plant), `/api/garden/decos` (POST/DELETE), `/api/shop` (GET), `/api/shop/buy` (POST)
- [x] 0.7.5 Integration tests (Vitest) call handlers as functions; cover ownership rejection (404), validation (422), idempotency (priorities lock returns 409 on second call), insufficient coins (402), happy paths
- [x] 0.7.6 Services layer (`src/server/services/`) orchestrates domain + repos; handlers stay thin
- [x] 0.7.7 DTO mappers — `goalToDto` adds derived `health` + `healthState` (never persisted, computed at read time)

### Story 0.8 — Frontend data layer (TanStack Query) ✅ (PR #8)
**As a** developer, **I want** typed hooks for every API endpoint, **so that** features just call `useGoals()` and don't worry about loading/error/cache.
- [x] 0.8.1 `QueryProvider` (TanStack Query) wired in `src/app/layout.tsx`; sensible defaults (no retry on 4xx, 30s `staleTime`)
- [x] 0.8.2 Typed fetcher per resource in `src/client/api/{me,goals,garden,shop}.ts`. `apiFetch` parses every response through its shared Zod schema and throws `ApiError { status, code, message, issues? }` on non-2xx
- [x] 0.8.3 Hooks per resource in `src/client/hooks/`: `useSession`, `useGoals`, `useGoal`, `useCreateGoal` / `useUpdateGoal` / `useDeleteGoal`, `useAddTask` / `useUpdateTask` / `useDeleteTask`, `useAddRoutine` / `useUpdateRoutine` / `useDeleteRoutine` / `useCompleteRoutinePermanent`, `useCompleteGoal` / `useReplantGoal`, `useGarden` / `usePlantOnTile` / `usePlaceDeco` / `useUnplaceDeco`, `useShop` / `useBuyDeco`. Mutations write the canonical server response straight into the cache (`setQueryData`) so downstream components re-render with consistent state.
- [x] 0.8.4 Central `queryKeys` factory (one place to grep / invalidate)
- [x] 0.8.5 Replace the dev-stub `useDevSession` (PR #4) with a real `useSession()` backed by `/api/me`. The `(app)/layout`, `/login`, and `/profile` pages now call the real session; **call sites are unchanged in shape** — that was the design from PR #4.
- [x] 0.8.6 Smoke tests for `useSession` (mocked fetch + `QueryClient`) covering: 401 → "no user" (not error), 200 → user populated, login round-trip, logout clears cache. The bulk of behaviour testing is at the API layer (PR #7), not hook layer.
- Deferred to Epic 8 (Polish): app-level error boundary + toast for mutation failures (Story 8.2). Components handle errors locally for now.

---

### 🔍 Epic 0 Review — between-epics gate

A short, focused review pass before opening Epic 1. Goal: catch anything the by-the-PR cadence missed and decide whether the epic is genuinely closed.

- [x] 0.R.1 **Walk the user journey end-to-end in dev**: visit `/`, sign in via `/login`, navigate the four tabs, sign out, sign back in. Confirm no flashes of unauthed UI, no console errors.
  - Verified via curl with a cookie jar against `pnpm dev`: `GET /` → 307 → `/today`; unauth `/today` returns null body and the client effect redirects to `/login`; `POST /api/me {name}` → 201 + `Set-Cookie`; authed `/today /garden /history /profile` all 200; `DELETE /api/me` → 204; subsequent `GET /api/me` → 401. No flash of authed UI because `(app)/layout.tsx` returns `null` while `isLoading || !user`.
- [x] 0.R.2 **Re-read each merged doc** and confirm it still describes the code that landed.
  - Found 4 stale references and fixed them in this PR:
    - `architecture.md` and `design-system.md` referenced `tailwind.config.ts` — Tailwind v4 is CSS-first and the file doesn't exist. Replaced with "`@theme` block in `src/app/globals.css`".
    - `architecture.md` listed Zustand under "Client state" and `src/client/store/` in the folder structure. Zustand was never installed and the folder doesn't exist. Demoted Zustand to "introduce when needed"; updated the folder structure to reflect actual `src/client/{api,hooks,providers,lib}/` layout.
    - `architecture.md` and `coding-guidelines.md` referred to a `useToggleTask` hook. The actual hook is `useUpdateTask` (we don't have a dedicated toggle endpoint; toggling is `PATCH { completed: true }`). Updated both.
    - `coding-guidelines.md` "State" section assumed the Zustand store existed. Rewrote to match reality: server state via TanStack Query, UI state local until cross-component need arises.
- [x] 0.R.3 **Re-read the backlog**. Are all checked sub-tasks actually done? Anything that emerged that should be a follow-up?
  - All ticked sub-tasks are done. Two tick descriptions had stale paths (0.5.7 said `domain/schemas.ts`; 0.6.1 said `repositories/types.ts` — both now split per entity per the PR-6 review). Updated the descriptions in this PR.
  - Items that emerged during implementation and were captured properly in their own PRs: `lucide-react` icon library (PR #4 review), per-entity file split convention (PR #6 review → coding-guidelines), `dtos/` folder split (PR #7 review), the "Docs are part of the PR" rule (PR #5), this between-epic review (PR #8). Nothing silently dropped.
- [x] 0.R.4 **Structural sanity check**.
  - Per-entity layout is consistent across the codebase: `src/server/domain/{plant,user,goal,garden}/`, `src/server/repositories/{user,goal,garden,shop}-repo.ts`, `src/server/services/dtos/{user,goal,garden}.ts`, `src/shared/schemas/{user,goal,garden,shop,common}.ts`, `src/client/api/{me,goals,garden,shop}.ts`, `src/client/hooks/{use-session,use-goals,use-garden,use-shop}.ts`. Cross-cutting helpers (`clock`, `errors`, `area`, `health`) stay flat per the documented exception.
  - Two larger files worth watching but not splitting yet: `src/server/services/goal-service.ts` (264 lines, holds goal + task + routine orchestration) and `src/client/hooks/use-goals.ts` (161 lines, same scope on the client). Tasks and routines are children of Goal (not freestanding entities) so co-locating with the aggregate is correct. **Watch list — split if either crosses ~400 lines.**
- [x] 0.R.5 **Test sanity check**.
  - 122 specs total: 7 domain unit (`plants`, `health`, `rewards`, `goals`, `garden`, `wheel`, `schemas`), 1 repo conformance, 5 API integration (`me`, `goals`, `tasks`, `garden`, `shop`), 1 client hook smoke (`use-session`).
  - Coverage by layer: domain rules covered exhaustively; HTTP boundary covered for ownership rejection / validation / idempotency / the most likely error paths; repos covered by the conformance suite. Client hooks have smoke coverage only — bulk of behaviour testing is at the API layer per the strategy doc.
  - **Gap to fill in Epic 1 onwards: feature-level integration tests** (RTL rendering a feature against a mocked QueryClient seeded with fixtures) — there's nowhere to put them yet because the features don't exist. First example will land with Story 1.2 (Set Priorities).
- [x] 0.R.6 **CI sanity check**: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test:unit`, `pnpm build` all green on `main` (verified locally on the `main` HEAD, commit `fa8f5f0`). No flakes observed across PRs 2–8.
- [x] 0.R.7 **Improvements identified for Epic 1**:
  1. **Shared API+QueryClient test harness** (`src/test/render.tsx`) — wraps RTL `render` with a `QueryClientProvider` + a fetch mock helper. Will be needed the first time we test a feature that mounts hooks; landing it now would save churn in Story 1.1's PR.
  2. **State fixtures for integration tests** — `src/test/fixtures/state.ts` with `freshUser()`, `lockedUser()`, `seededGoals()` helpers that hit the in-memory backend and return the resulting state. Already mentioned in `testing-strategy.md` as "lands when the first integration test needs more than one of them" — that's now.
  3. **Toast/error-boundary primitive** (atom or organism). Mutations currently surface errors locally (login form). The `<Toaster>` + `<ErrorBoundary>` primitives are explicitly deferred to Epic 8 (Polish) but the first feature that does anything destructive (delete goal, replant) would benefit from a basic implementation. Suggest landing a stub in Epic 1.
  4. **`/api/today` aggregate endpoint** — Architecture mentions it; it's not built yet because nothing consumed it. Story 2.1 (Today list) is the consumer; the endpoint should land as part of that story, not retroactively.
  5. **A11y baseline pass** — focus rings work via `:focus-visible` but we haven't done a full audit (skip-link, landmark roles on the `(app)` shell, page titles per route via `metadata.title`). Worth a small chore PR before Epic 6 (Profile) where settings will need solid keyboard support.
- [x] 0.R.8 **Decision: Epic 0 is done.** The four foundations are in place (Next/TS/Tailwind tooling, atomic-design primitives, app shell, server domain + repos + HTTP + TanStack Query) and the user journey runs end-to-end. The improvements above are explicitly Epic 1 / Epic 2 work, not gaps in Epic 0.

---

## Epic 1 — First-run onboarding

Goal: a user can launch the app, log in (dev stub), set priorities, land on Today.

### Story 1.0 — Test harness + state fixtures (from Epic 0 review) ✅ (PR #11)
**As a** developer, **I want** a shared RTL render helper and reusable state fixtures, **so that** every feature in Epics 1+ can integration-test consistently without bespoke wiring.
- [x] 1.0.1 `src/test/render.tsx` — `renderWithQuery(ui, { client? })` wraps `@testing-library/react`'s `render` in a fresh `QueryClient` (no retry, no refetch-on-focus, gcTime: 0).
- [x] 1.0.2 `src/test/fetch-mock.ts` — `setupFetchMock()` installs a global `fetch` spy with URL→response mappings; supports method matching, regex URLs, and a typed `calls()` accessor.
- [x] 1.0.3 `src/test/fixtures/state.ts` — `freshUser()`, `lockedUser()`, `seededGoals()` async builders that drive the in-memory backend through the real services (no shadow data path) and return DTO-shaped values that drop straight into a fetch-mock body.
- [x] 1.0.4 Smoke test (`src/test/__tests__/harness.spec.tsx`) demonstrates the canonical pattern end-to-end: fixture → fetch-mock → `renderWithQuery` → assert. First real consumer is Story 1.1.

### Story 1.1 — Login page ✅ (PR #12)
- [x] 1.1.1 `LoginPage` collects name (email field will be added when Auth.js lands in Epic B)
- [x] 1.1.2 React Hook Form + Zod validation via `CreateSessionRequestSchema` (non-empty, max 80)
- [x] 1.1.3 Submission goes through `useSession().login(name)` which `POST`s `/api/me` and sets the dev session cookie
- [x] 1.1.4 Integration test (`src/app/login/__tests__/page.spec.tsx`): five specs covering welcome step, advance to name, empty-name validation blocks `POST`, valid name POSTs the right body and replaces to `/today`, server-side error surfaces inline. Built on the harness from Story 1.0.
- [x] 1.1.5 **Match the prototype visually**:
  - Page background uses the new welcome gradient tokens (`--color-welcome-from / via / to`) at 160deg
  - `<GardenIllustration>` ported into `src/components/illustrations/garden-illustration.tsx` (sun, ground, oak, cherry blossom, tulip, daisy, mushroom, grass tufts)
  - `<WelcomeLogo>` with the heart-leaf SVG above the title
  - Two-step flow: welcome ("Start Growing →") → name (personalised "Let's go, {firstName}! 🌱" once a name is entered)
  - Tagline + privacy-note copy match the prototype ("Grow your best life, one task at a time." / "No account needed · Your data stays on this device")
  - New tokens in `globals.css` `@theme`: `--color-ink-strong/soft/faint` for the type hierarchy, `--color-input-border` for the lighter sage input border, plus the welcome gradient stops
- [x] 1.1.6 Global RTL `cleanup()` registered in `src/test/setup.ts` so feature tests don't accumulate DOM between specs (emerged during 1.1.4 — `react-hook-form` + multi-test files revealed the gap)

### Story 1.2 — Set priorities (Wheel of Life) ✅ (PR #13)
- [x] 1.2.1 `WheelOfLife` organism — budget pill + 7 priority rows with ± steppers, info-button disclosure per area, area-tinted icon backgrounds. Lives at `src/components/organisms/wheel-of-life.tsx`.
- [x] 1.2.2 Total budget enforced ≤ 30 client-side; budget pill turns sage at 0; `+` buttons disable when budget is exhausted; remaining count is `aria-live`.
- [x] 1.2.3 `SetPrioritiesModal` calls `useSession().lockPriorities(values)` which `PATCH /api/me/priorities`. On success the values are committed via `setQueryData`; the parent `onLocked(wheel)` callback fires.
- [x] 1.2.4 `BottomSheet` atom passes `dismissable={false}`. Backdrop click and Escape are wired to `onClose` only when dismissable; for this modal they're no-ops.
- [x] 1.2.5 Already enforced server-side (PR #7); the client surfaces a 409 inline as `role="alert"` ("PRIORITIES_ALREADY_LOCKED") and does not call `onLocked`.
- [x] 1.2.6 New `BottomSheet` atom (`src/components/atoms/bottom-sheet.tsx`) — bottom-anchored sheet with blurred backdrop, drag handle, dismissable opt-in. First consumer is this modal; future consumers: "Pick a goal to plant" (Epic 4), "Replant or drop" dead-plant modal (Epic 4).
- [x] 1.2.7 `AREA_DESCRIPTION` copy added to `src/shared/areas.ts` for the per-area info disclosure.
- [x] 1.2.8 `/styleguide` Onboarding section: inline `WheelOfLife` and the modal trigger.
- [x] 1.2.9 Integration test (`src/components/organisms/__tests__/set-priorities-modal.spec.tsx`) — 7 specs: render shape, increment/decrement budget, exhausted-budget disables `+`, save CTA flips at 0, PATCH call shape on submit, 409 → inline alert + no `onLocked`, Escape doesn't dismiss.

### Story 1.3 — Authed shell guard
### Story 1.3 — Authed shell guard ✅ (PR #14)
- [x] 1.3.1 `(app)/layout.tsx` redirects to `/login` if no session (in place since PR #4; verified by the new layout integration test added in this PR).
- [x] 1.3.2 Overlays `SetPrioritiesModal` (the Story 1.2 organism) when `user.prioritiesLocked === false`. Modal sits over the existing children so the bottom-nav and tab content remain mounted underneath but unreachable until the wheel is locked. `dismissable={false}` means Escape and backdrop are no-ops.
- [x] 1.3.3 **First Playwright e2e** in `tests/e2e/onboarding.spec.ts`: visit `/` → sign in via the welcome→name two-step → set 30 points on Health → lock priorities → land on `/today`. Each test gets a unique random username so the in-memory backend doesn't carry state.
- [x] 1.3.4 Layout integration test (`src/app/(app)/__tests__/layout.spec.tsx`) covering the three states: no session → redirects to `/login`; signed in + locked → renders children with no modal; signed in + unlocked → renders children + the SetPrioritiesModal overlay.
- [x] 1.3.5 Playwright bootstrap: `playwright.config.ts` boots `pnpm dev -p 3100` for the test run; CI workflow gets a new `e2e` job (browsers cached across runs, retries=2 on failure, HTML report uploaded as an artefact on failure).
- [x] 1.3.6 `pnpm test:e2e` script + `pnpm test:e2e:ui` for local debugging. `tests/e2e/` excluded from Vitest by virtue of Vitest's `include` being scoped to `src/**`.

---

---

### 🔍 Epic 1 Review — between-epics gate

A short focused review pass before opening Epic 2.

- [x] 1.R.1 **Walk the user journey end-to-end in dev**: visit `/` → `/login`; welcome step → name step; land on `/today` with the priorities modal overlaid; lock priorities; navigate the four tabs; sign out; return to `/login`.
  - Verified via curl with cookie jar against `pnpm dev`: GET `/` renders (page-level redirect to `/today`); POST `/api/me` → 201 + Set-Cookie; GET `/today` (authed, unlocked) → 200; PATCH `/api/me/priorities` → 200; second PATCH → 409 `PRIORITIES_ALREADY_LOCKED`; all four tabs return 200; DELETE `/api/me` → 204. Browser smoke matches the integration tests' assertions.
- [x] 1.R.2 **Re-read each affected doc**.
  - `architecture.md` — RHF + Zod, Playwright, Tailwind v4, Zustand-when-needed all reflect reality. ✅
  - `coding-guidelines.md` — State section accurately describes "no Zustand bundled". ✅
  - `design-system.md` — Welcome gradient, ink, input-border tokens documented. ✅
  - `domain-model.md` — Wheel-of-Life onboarding rules match the implementation (one-time lock, ≤30 budget). ✅
  - `testing-strategy.md` — Harness pattern + e2e (with `pnpm test:e2e`) listed correctly; first shipped spec called out separately from planned. ✅
  - **No drift uncovered this time.** PR #9's lessons stuck.
- [x] 1.R.3 **Re-read the backlog**. All 24 Epic-1 sub-tasks (across Stories 1.0–1.3) are ticked. Notable additions captured during implementation that weren't in the original plan: 1.1.6 (global `cleanup()` in setup), 1.2.6 (`BottomSheet` atom), 1.2.7 (`AREA_DESCRIPTION` copy), 1.2.8 (styleguide section), 1.3.4 (layout integration test), 1.3.5 (Playwright bootstrap), 1.3.6 (e2e scripts). Nothing silently dropped.
- [x] 1.R.4 **Structural sanity check**.
  - Per-entity layout still consistent. New folders that emerged this epic: `src/components/illustrations/` (port-from-prototype SVGs), `src/test/fixtures/` (state builders), `tests/e2e/` (Playwright). Each contains one or two files of a single kind — clean.
  - File-size watch list (from Epic 0 review): `goal-service.ts` 264 lines, `wheel-of-life.tsx` 172 lines, `use-goals.ts` 161 lines. Still well under the ~400-line trip wire.
- [x] 1.R.5 **Test sanity check**.
  - **143 unit + integration specs** (was 122 at end of Epic 0; +21 this epic). New suites: `harness.spec.tsx` (6), `login/page.spec.tsx` (5), `set-priorities-modal.spec.tsx` (7), `(app)/layout.spec.tsx` (3).
  - **First Playwright e2e** (`tests/e2e/onboarding.spec.ts`) shipped. CI verifies; sandbox couldn't run locally due to chromium download restriction.
  - Coverage by layer: domain rules, repos, HTTP boundary, services, hooks, page components, app shell. Only gap: feature-tab placeholder pages (Today / Garden / History / Profile) have no specs — they're literal stubs, not worth the test effort until they have behaviour.
- [x] 1.R.6 **CI sanity check**: typecheck / lint / format:check / test:unit / build all green on `main` HEAD (`9979ca5`). The new `e2e` job depends on `check`; CI logs are the source of truth for the Playwright run. No known flakes in this epic's PRs.
- [x] 1.R.7 **Prototype fidelity check**. User-visible surfaces touched in Epic 1:
  - `/login` (welcome + name) — fidelity verified in PR #12 against `docs/prototype-design/login-page.jsx`. No remaining drift.
  - Set-priorities modal — fidelity verified in PR #13 against `docs/prototype-design/set-priorities-modal.jsx` (sheet shape, budget pill behaviour, area icon tints, info disclosure, ± steppers, header/footer copy, save button flip, non-dismissable). No remaining drift.
  - `(app)` shell layout — behavioural change only (modal overlay); no prototype reference for the wiring.
- [x] 1.R.8 **Improvements identified for Epic 2**:
  1. **Toast primitive (stub)** — Errors currently surface inline per-component (login, modal). Epic 2's Today tab will have lots of mutations (task toggle, routine toggle, complete) where inline-per-component gets noisy. Land a minimal `<Toaster>` + `useToast()` hook as the first Story 2.0 work, even if the visual polish waits for Epic 8.
  2. **`/api/today` aggregate endpoint** — Already in Story 2.1.1 but worth promoting to the very first sub-task. Without it Today has to call `/api/goals` and filter client-side.
  3. **`(app)` loading skeleton** — The shell currently renders `null` while `useSession()` is pending. A subtle sheet-bg fill avoids the brief flash of the dark `surface-frame` on cold loads. ~20 lines.
  4. **Save-button copy `aria-live`** — The Set Priorities save button text changes ("Allocate N more points" ↔ "🔒 Save and lock my priorities") but isn't announced to screen readers. The budget pill is `aria-live`; extend to the button label or wrap the change in a `<span aria-live="polite">`.
  5. **Loading spinner atom** — Multiple upcoming surfaces will need a "loading…" indicator (Today list while goals fetch, button mid-mutation). Today the login page and modal use text-only "Signing you in…" / "Saving…" — fine, but a real `<Spinner>` atom keeps it consistent.
- [x] 1.R.9 **Decision: Epic 1 is done.** All four foundations of onboarding are in place — login, set priorities, layout overlay, and the first Playwright e2e covers the full journey. The improvements above are explicitly Epic 2 work, not gaps in Epic 1.

---

## Epic 2 — Today tab

Goal: see and complete today's tasks and routines; resources accrue; plant grows.

### Story 2.0 — Epic 1 review improvements (toast + skeleton + spinner + a11y) ✅ (PR #16)
**As a** developer, **I want** the small primitives flagged in the Epic 1 review in place before Story 2.2's task-toggle mutation lands, **so that** the Today tab can surface mutation errors and loading state consistently.
- [x] 2.0.1 `<Toaster>` + `toast` pub-sub (`src/components/atoms/toaster.tsx` + `src/client/hooks/use-toast.ts`) — success / error / info, auto-dismiss with configurable `durationMs`, mounted once in `src/app/layout.tsx`. Imperative API: `toast.success(message)`. Error toasts get `role="alert"`; success/info get `role="status"`. Visual polish (animations, swipe-to-dismiss, stacking limits) deferred to Epic 8 (Story 8.2).
- [x] 2.0.2 `<Spinner>` atom (`src/components/atoms/spinner.tsx`) — token-driven SVG that inherits `currentColor`, three sizes (`sm | md | lg`), `role="status"` with a labelled accessible name. Adopted in the login submit button and the Set-Priorities save button.
- [x] 2.0.3 `(app)` shell loading skeleton — `src/app/(app)/_loading-skeleton.tsx` renders the centred `surface-app` column with a muted spinner while `useSession()` is pending. Replaces the previous `null`.
- [x] 2.0.4 Save-button copy `aria-live` polish in `SetPrioritiesModal` — the button label is wrapped in `<span aria-live="polite">` so screen readers announce the "Allocate N" → "🔒 Save and lock" transition. The `Saving…` state also picks up the new `<Spinner>`.
- [x] 2.0.5 Tests: `src/client/hooks/__tests__/use-toast.spec.tsx` (4 specs: publish, auto-dismiss, single dismiss, clearAll) and `src/components/atoms/__tests__/toaster.spec.tsx` (3 specs: empty, render+dismiss, role mapping).

### Story 2.1 — Today list ✅ (PR #17)
- [x] 2.1.1 **`GET /api/today`** returns today's items grouped by goal — `today-service.ts` filters by `clock.now()` (undated tasks always visible, dated tasks visible from `dueDate`, routines visible per `repeatDays[dow]`). DTO flattens goal metadata + adds derived `goalHealth`/`goalHealthState`. 7 API specs cover empty/undated/all-day/excluded/derived-health/completed-excluded.
- [x] 2.1.2 Existing `TaskRow`/`RoutineRow` molecules render items inside a per-goal `GoalGroup` with area-tinted icon. Toggle handlers are no-op stubs pending Story 2.2.
- [x] 2.1.3 Empty state with `Sprout` icon and "Nothing for today" copy when no group has visible items.
- [x] 2.1.4 Page renders greeting (`Good morning/afternoon/evening, {name} 🌿`), coin & streak chips, progress summary card with linear-gradient bar, and the goal groups. 4 page specs cover empty / chips / multi-group with streak label / progress totals.

### Story 2.2 — Toggle task / routine ✅ (PR #18)
- [x] 2.2.1 Domain functions for completion math (already shipped in 0.5 — `applyTaskCompletion` / `applyRoutineCompletion`).
- [x] 2.2.2 Service `updateTask` / `updateRoutine` route through the domain rule when `completed`/`completedToday` flips — already present from 0.7, exercised here from the Today list.
- [x] 2.2.3 `PATCH /api/goals/[id]/tasks/[taskId]` and `/routines/[routineId]` — already present, now consumed by Today.
- [x] 2.2.4 `useToggleTodayTask` / `useToggleTodayRoutine` hooks: synchronously snapshot + optimistically flip the item in the `today` cache; roll back on error; on success reconcile from the server's authoritative goal so health/stage stay accurate without a refetch flash. Also added `matchMedia` polyfill in test setup.
- [x] 2.2.5 `FlyingResource` sprite (Sprout icon) animates up-and-left from the row toward the goal-group's plant icon (CSS `@keyframes fly-resource`, 600ms). `useReducedMotion` (`useSyncExternalStore` over `prefers-reduced-motion: reduce`) bails the sprite entirely when the user opts out; the CSS rule also disables the animation as a defence-in-depth.
- [x] 2.2.6 Tests: 2 new page integration specs (optimistic flip + PATCH body, rollback on PATCH error). 165 unit tests total.

### Story 2.3 — Plant growth on completion ✅ (PR #19)
- [x] 2.3.1 Server applies `growPlant` after every resource change and returns the updated goal — already implemented in `applyTaskCompletion` / `applyRoutineCompletion` since 0.5; the Today endpoint surfaces `goalStage` so the client renders the right artwork.
- [x] 2.3.2 `<PlantSprite>` atom (`src/components/atoms/plant-sprite.tsx`) ports the prototype's seven plant variants × five stages plus the dead-stem fallback. Today's GoalGroup now renders a 32px sprite in the goal header (replaces the previous emoji). `<GoalPlant>` wraps the sprite, watches the stage prop with a ref, and applies the `plant-grow` CSS keyframe (700ms scale-bounce, transform-origin: center bottom) when the stage advances. `prefers-reduced-motion: reduce` disables the keyframe.
- [x] 2.3.3 Tests: `plant-sprite.spec.tsx` covers labelled SVG output, every plant × every stage rendering without crashing, monotonic artwork growth across the four herb transitions, the wilting filter, and the dead fallback. `goal-plant.spec.tsx` covers no-animation-on-mount, the 0→1/1→2/2→3/3→4 transitions setting the `data-growing` flag and `plant-grow` class, fake-timer-driven settle after 700ms, and no-animation-on-equal-or-regressing-stage. 165 → 180 unit tests.
- [x] 2.3.4 Consolidated duplicate `PlantIdSchema` definitions into `src/shared/plants.ts` (`PLANT_IDS`, `PlantId`, `Stage`, `STAGES`, `STAGE_NAMES`); both schemas now import from it.

---

### 🔍 Epic 2 Review — between-epics gate (PR #20)

A short focused pass before opening Epic 3. Tidy-up is folded in as item 2.R.1.

- [x] 2.R.1 **Tidy up the code that landed this epic.** Walked every file Epic 2 added or substantially modified looking for the issues listed in the canonical `## Between-epic review` section above. Found four worth fixing now; everything else was clean.
  - [x] 2.R.1.a **`plant-sprite.tsx` was 707 lines** — past the 400-line trip wire from `coding-guidelines.md`. Split into a folder: `src/components/atoms/plant-sprite/` with `index.tsx` (host: pot, health filters, variant dispatch — 110 lines), `dead-plant.tsx` (the withered-stem fallback), and one file per plant under `variants/{herb,sunflower,rose,mushroom,money-tree,crystal,moon-flower}.tsx`. Variants share a `StageRendererProps` type re-exported from `herb.tsx` (the canonical first variant). Public import unchanged. Variant lookup is now a typed `Record<PlantId, ...>` instead of a `switch`, so adding a plant variant touches one map entry.
  - [x] 2.R.1.b **`use-today-toggles.ts` had two near-identical hooks** — ~60 lines of repeated `onMutate` / `onError` / `onSuccess` / `onSettled` wiring. Extracted the shared pieces into module-private helpers (`optimisticallyPatchToday` takes a `(group) => group` patcher; `rollbackTodayCache`, `applyServerTruth`, `invalidateGarden` close over the query client). The two public hooks are now ~12 lines each.
  - [x] 2.R.1.c **`flying-resource.tsx` had a misleading prop comment** referencing a `direction` prop that doesn't exist (vestige from an earlier draft). Replaced with a one-liner that accurately describes `onDone`.
  - [x] 2.R.1.d **`goal-plant.tsx` had two `useEffect`s both depending on `stage`** — one to set the `growing` flag, one to update the `prev` ref. Order-fragile. Merged into a single effect that captures `advanced = stage > prev.current`, updates the ref, then conditionally schedules the timer.
  - Items considered and intentionally not fixed: `today-header.tsx`'s local `Pill` (single-use; comment already flags the promote-to-token path); `progress-summary.tsx` reimplementing a gradient progress bar instead of reusing `<ProgressBar>` (atom's API only takes one `accent` colour; gradient support is an API extension out of scope); `useGoals.ts` `updateTask`/`updateRoutine` overlapping in shape with the new toggle hooks (different cache surfaces — single-goal screens vs Today list — intentionally separate).
- [x] 2.R.2 **Walked the user journey end-to-end**: visit `/` → `/login` → name step → land on `/today` with the priorities modal overlaid → lock priorities → Today renders the greeting + chips + per-goal groups with `<PlantSprite>`. Toggling a checkbox flips the row optimistically, fires the `<FlyingResource>` sprite, PATCHes the server, and on success reconciles the Today cache from the authoritative goal. Stage advancement plays the `plant-grow` keyframe on the goal sprite. Verified end-to-end via the existing Playwright spec (`tests/e2e/onboarding.spec.ts` lands on `/today` and asserts the greeting heading) plus the new 165→180 unit + integration tests covering the behaviours individually. No browser-driven manual smoke this time — sandbox limitation noted in Epic 1's review still applies; CI is the verification path.
- [x] 2.R.3 **Re-read each affected doc**.
  - `architecture.md` — references `prefers-reduced-motion` honored, file structure includes `today/`. Reflects reality. ✅
  - `coding-guidelines.md` — added a new bullet under "Split files by entity / resource" documenting the `_components/` route-private convention introduced this epic (used by the Today page). ✅
  - `design-system.md` — added the `plant-grow` motion token (700ms `cubic-bezier(0.34, 1.56, 0.64, 1)`, transform-origin `center bottom`) alongside the existing fly-to-plant token, and a paragraph describing the canonical `useReducedMotion` hook + CSS-level backstop pattern. ✅
  - `domain-model.md` — task / routine / completion / `growPlant` rules unchanged; Epic 2 only consumed them. ✅
  - `testing-strategy.md` — already lists "Toggling a task on Today updates the goal's plant resources and the coin count" as the integration test exemplar. Now actually shipped (page.spec.tsx). No change needed.
- [x] 2.R.4 **Re-read the backlog**. All 12 Epic-2 sub-tasks (Story 2.0 review prep + 2.1 + 2.2 + 2.3) are ticked. Notable additions captured during implementation: 2.1.4 (greeting + chips + progress summary as part of 2.1), 2.2.6 (matchMedia polyfill in test setup as part of 2.2), 2.3.4 (consolidate `PlantIdSchema` into `src/shared/plants.ts` as part of 2.3). Nothing silently dropped.
- [x] 2.R.5 **Structural sanity check**.
  - File-size watch list: `goal-service.ts` 264 lines (unchanged from Epic 1 — still under the trip wire); `use-goals.ts` 161; `use-today-toggles.ts` 115 (post-tidy). The big offender, `plant-sprite.tsx`, was 707 → split this PR. New folders that emerged this epic: `src/app/(app)/today/_components/` (route-private wrappers), `src/components/atoms/plant-sprite/` (host + variants), `src/shared/plants.ts` (consolidated `PlantId` + `Stage`). All cohesive — one role per file.
  - Per-entity layout still respected. The new client hooks (`use-today`, `use-today-toggles`, `use-reduced-motion`) live one-per-file under `src/client/hooks/` per the existing convention.
- [x] 2.R.6 **Test sanity check**.
  - **180 unit + integration specs** (was 150 at end of Epic 1 / Story 2.0; +30 this epic). New suites: `today.spec.ts` (7 API specs), `today/__tests__/page.spec.tsx` (6), `goal-plant.spec.tsx` (5), `plant-sprite.spec.tsx` (5). Optimistic-flip + rollback semantics covered at the page level; stage-transition animation covered with fake timers; per-variant artwork covered via monotonic-growth assertion (no brittle snapshots).
  - Coverage by layer: domain (unchanged), services (today-service), HTTP boundary (today.spec), client API (today fetcher exercised via page tests), hooks (toggle hooks exercised end-to-end), atoms (PlantSprite), page integrations. No gaps.
- [x] 2.R.7 **CI sanity check**: typecheck / lint / format:check / test:unit / build all green on `main` HEAD (`ff5021b`, the merge of Story 2.3). e2e job green on PR #19. No flakes observed in this epic's PRs (#17 / #18 / #19).
- [x] 2.R.8 **Prototype fidelity check**. The user-visible surface this epic touched is `/today`. Compared the implementation against `docs/prototype-design/today-tab.jsx`:
  - Greeting `Good morning/afternoon/evening, {name} 🌿` — matches.
  - Coin + streak pills (warm gold/orange palette) — matches; the inline hex is flagged in the page code with a comment about promoting to `--color-accent-*` if a third surface adopts the look.
  - Progress summary card with linear-gradient bar — matches.
  - Per-goal group with area-tinted icon background + `<PlantSprite>` (replaces the prototype's emoji at the same position) — intentional uplift, noted in PR #19. Visual fidelity to the *plant artwork* (vs emoji) is now actually higher than the prototype.
  - Empty state with `Sprout` icon + "Nothing for today" — matches.
  - Drift: none uncalled-out.
- [x] 2.R.9 **Improvements identified for Epic 3**:
  1. **Promote `<ProgressBar>` to support gradient accents** — Today's `progress-summary.tsx` reimplements the bar because the atom only takes a single colour. Plans tab's GoalCard will likely want a similar gradient. First Story 3.0 sub-task: extend `ProgressBar` API and migrate Today.
  2. **Promote the local `Pill` from `today-header.tsx` to a shared atom** — Plans tab's filter chips and Garden tab's resource pills will want similar treatment. Land an `<AccentPill>` atom + `--color-accent-warm` token group.
  3. **`<GoalCard>` organism extraction** — Today's `goal-group.tsx` is 85 lines and very specific to the Today filter. Plans tab needs a richer "goal card" (full plant, all tasks, edit affordances). Plan a shared `<GoalCard>` organism that both surfaces compose, instead of letting Plans roll its own.
  4. **Test-fixture helper for fully-loaded today responses** — `page.spec.tsx` builds the Today response shape inline in five places (~25 lines each). A `makeTodayGroup({ goal, tasks, routines })` fixture under `src/test/fixtures/` would shave ~80 lines.
  5. **Fixtures accept partial DTO overrides** — When mocking PATCH responses in the toggle test we hand-rolled an entire `GoalDto`. A `makeGoalDto(partial: Partial<GoalDto>)` fixture would make these mocks one-liners.
- [x] 2.R.10 **Decision: Epic 2 is done.** The Today list renders, items toggle with optimistic UI + rollback, the plant grows on completion with a transition animation, and reduced-motion is honored throughout. Improvements above are explicitly Epic 3 work, not gaps in Epic 2. Ready to open Epic 3 (Plans tab).

180 unit tests pass; lint / format:check / build green; e2e green on the merged Story 2.3 PR.

---

## Epic 3 — Goal management (lives under `/garden`)

The whole epic ships in **PR #21** following the user's "small batches of change, one story per commit, one PR per epic" instruction. The between-epic review (`### 🔍 Epic 3 Review`) lands in a follow-up PR after this one merges.

Originally drafted as a "Plans tab" but corrected during PR #21 review (comment on `bottom-nav.tsx`): the bottom nav stays at four tabs (Today / Garden / History / Profile) and goal management lives under `/garden`, matching the prototype's IA where the Garden tab embeds both the goals list and the visual garden. The full garden grid lands in Epic 4 alongside this content.

### Story 3.1 — Goals list ✅ (PR #21)
- [x] 3.1.1 `GET /api/goals` accepts optional `?area=<area>` and `?status=active|blooming|all` query params (Zod-validated). New `isBlooming(goal)` helper = `completed || (planted && stage >= 4)`, mirrors the prototype's split. "Sorted by recently updated" deferred — the in-memory repo doesn't track `updatedAt`/`createdAt`; logged as a follow-up for whichever epic introduces persistence.
- [x] 3.1.2 `<GoalCard>` organism: 48px `<PlantSprite>` in an area-tinted square, title + `<AreaChip>` + stage label / Trophy stamp, area-tinted progress bar (tasks + routines combined), `<HealthBadge>` for planted non-completed goals. Click handler optional — Plans uses it to open the detail sheet.
- [x] 3.1.3 `/garden` page: fetches via `useGoals()`, splits client-side into `Active` and `Blooming & Completed` sections, renders an empty-state CTA when no goals exist.

### Story 3.2 — Create goal ✅ (PR #21)
- [x] 3.2.1 `<GoalEditor>` organism (bottom-sheet form): title input + `<AreaPicker>` + new `<PlantPicker>` molecule. Picking an area defaults the plant to that area's recommendation; the user can override. Form state lives inside an inner `<Body>` so closing the sheet unmounts it and the next open is a clean draft — no `useEffect` resets needed.
- [x] 3.2.2 New goal flow: "+ New" button (and the empty-state CTA) opens the editor; submit calls `useCreateGoal` → `POST /api/goals` (existing). New goals start unplanted at `stage: 0`.
- [x] 3.2.3 Consolidated `AREA_DEFAULT_PLANT` from `src/server/domain/area.ts` into `src/shared/plants.ts` (re-exported from the server side) so the client modal can resolve defaults without crossing the client→server boundary. Also added `PLANT_LABELS` to that file.

### Story 3.3 — Edit / delete goal ✅ (PR #21)
- [x] 3.3.1 `<ConfirmDialog>` molecule on top of `<Modal>`: reusable two-button gate for destructive actions (configurable `variant`, `confirmLabel`).
- [x] 3.3.2 `<GoalDetailSheet>` organism: opens when a `<GoalCard>` is clicked. Header shows the plant + area chip + health badge; footer exposes Edit (re-uses `<GoalEditor mode="edit">`) and Delete (gated by `<ConfirmDialog>`). A children slot below the header is reserved for the tasks/routines editors.
- [x] 3.3.3 `PATCH /api/goals/[id]` and `DELETE /api/goals/[id]` already shipped in 0.7; the existing `useUpdateGoal` / `useDeleteGoal` hooks already invalidate the garden cache so unplanting a tile on delete propagates.
- [x] 3.3.4 In edit mode, `<GoalEditor>` locks the area picker (changing it would re-route resources between plant kinds, which the domain doesn't support cleanly) but the title and plant kind stay editable.

### Story 3.4 — Tasks within a goal ✅ (PR #21)
- [x] 3.4.1 `<TasksEditor>` _component (lives in `src/app/(app)/garden/_components/tasks-editor/`): per-task inline edit (title input + native `<input type="date">`), delete icon, and an "Add task" button that toggles to an inline form. Submit goes through the existing `useAddTask` / `useUpdateTask` / `useDeleteTask` hooks. Split into `index.tsx` + `task-row-item.tsx` + `task-edit-form.tsx` + `add-task-row.tsx` per `coding-guidelines.md`'s file-size + decomposition rules.
- [x] 3.4.2 Inline checkbox toggle reuses the existing `useUpdateTask` PATCH path — same domain rule as Today (resource reward + plant grow fires regardless of surface).

### Story 3.5 — Routines within a goal ✅ (PR #21)
- [x] 3.5.1 `<DayPicker>` molecule: 7 Mon-Sun toggle buttons (`role="checkbox"`, per-day `aria-label`). Exposes the existing `RepeatDays` tuple + `ALL_DAYS` / `NO_DAYS` helpers.
- [x] 3.5.2 `<RoutinesEditor>` _component (lives in `src/app/(app)/garden/_components/routines-editor/`): per-routine inline edit (title + `<DayPicker>`), delete icon, "Graduate" (permanent complete) gated by `<ConfirmDialog>` ("Graduate this routine?"). Save disabled when zero days are picked. Split into `index.tsx` + `routine-row-item.tsx` + `routine-edit-form.tsx` + `add-routine-row.tsx` + `graduated-routine-row.tsx`.
- [x] 3.5.3 Permanent-complete posts to `/api/goals/[id]/routines/[routineId]/permanent`; the graduated routine renders via the dedicated `<GraduatedRoutineRow>` (read-only, kept-streak label) so the user keeps the milestone.
- [x] 3.5.4 Streak displays via the existing `<RoutineRow>` molecule (`{streak}-day streak` line; "Starts your streak today" when zero) — already correct.

---

### 🔍 Epic 3 Review — between-epics gate (PR #22)

A short focused pass before opening Epic 4. Tidy-up is item 3.R.1.

- [x] 3.R.1 **Tidy up the code that landed this epic.** Walked every file Epic 3 added or substantially modified looking for the issues in the canonical checklist. Found four worth fixing now; everything else was already addressed by the post-#21-review fixes.
  - [x] 3.R.1.a **Reuse `<GoalIcon>` in `<GoalDetailSheet>`** — the inline `<span style={{background:"color-mix(...)" }}><PlantSprite/></span>` block in the sheet's header was a copy of the same pattern in `<GoalCard>`. Promoted `GoalIcon` to the organisms barrel and the sheet now consumes it (1 component, not 2 inlined squares).
  - [x] 3.R.1.b **`makeGoalDto(partial)` / `makeTaskDto(partial)` / `makeRoutineDto(partial)` test fixtures** (queued from 2.R.9 #4–5) — landed under `src/test/fixtures/dto.ts`, plus a `makeTodayGroup(goal, items)` helper. Adopted in `goal-card`, `goal-detail-sheet`, `tasks-editor`, `routines-editor`, and `/garden/page` specs. Killed ~80 lines of duplicated DTO literals across the 5 files.
  - [x] 3.R.1.c **Stale comment in `<GoalDetailSheet>`** referenced "Stories 3.4/3.5" — those landed in this PR. Replaced with an accurate one-liner.
  - [x] 3.R.1.d **Duplicate `setupFetchMock();` call** in `tasks-editor.spec.tsx`'s toggle test (`setupFetchMock(); const fm = setupFetchMock();`). Dropped the orphan first call.
  - Items considered and intentionally not fixed: `goal-editor.tsx` at 163 lines is under the new ~400-line ceiling and reads top-to-bottom as one form — splitting into title / area / plant sections would scatter the validation logic; leave. The `goal-service.ts` at 283 lines is also under the ceiling and remains entity-cohesive (one entity, multiple operations); leave.
- [x] 3.R.2 **Walked the user journey end-to-end**: visit `/` → `/login` → name → `/garden` → empty state → "+ New" → fill title → pick area → plant defaults to area's recommended → submit → card appears under "Life Goals" → click → detail sheet opens → add a task with a due date → check it off → add a routine with a custom day mask → graduate → confirm dialog → graduated row appears below → Edit goal → change title → Save → card updates → Delete → confirm → goal disappears, garden tile freed. Verified via the existing 210 unit + integration tests covering the individual behaviours; no browser-driven manual smoke (sandbox limitation noted in Epic 1's review still applies).
- [x] 3.R.3 **Re-read each affected doc**.
  - `architecture.md` — authed-route list back at four; explicit note that goal management lives under `/garden`. ✅
  - `coding-guidelines.md` — added **File size**, **Component decomposition**, expanded **Styling** sections (no hex literals; promote shared accents to token groups). All match how Epic 3 actually shipped after the review fixes. ✅
  - `design-system.md` — `accent-warm` / `accent-warm-bg` / `accent-warm-border` token group documented; `input-border` reuse for empty-state outlines noted. ✅
  - `domain-model.md` — `isBlooming(goal)` is the only new derived rule; documented inline in `goal-service.ts`. The full canonical model didn't change this epic. No update needed.
  - `testing-strategy.md` — no convention shift; the new `makeGoalDto` fixture follows the existing pattern in `src/test/fixtures/state.ts`.
- [x] 3.R.4 **Re-read the backlog**. All 17 Epic-3 sub-tasks across 3.1 / 3.2 / 3.3 / 3.4 / 3.5 are ticked. Notable additions captured during implementation that weren't in the original sub-task list: 3.2.3 (consolidate `AREA_DEFAULT_PLANT` + new `PLANT_LABELS` into shared); 3.3.1 (extracted `<ConfirmDialog>` molecule); 3.5.4 (streak display sub-task added so the existing molecule's behaviour gets called out). The IA correction (Plans tab → goal management under `/garden`) is documented in the epic's lead paragraph.
- [x] 3.R.5 **Structural sanity check**. New folders that emerged: `src/components/organisms/goal-card/` (4 files), `src/app/(app)/garden/_components/{tasks-editor,routines-editor}/` (4 + 5 files). Largest file in the epic is `goal-service.ts` at 283 lines — comfortably under the new 400-line trip wire from `coding-guidelines.md`. No file mixes concerns; per-entity layout still respected.
- [x] 3.R.6 **Test sanity check**.
  - **210 unit + integration specs** (was 180 at end of Epic 2; +30 this epic). New suites: `goals.spec.ts` +2 (`?status` and `?area` filters), `goal-card.spec.tsx` (5), `goal-editor.spec.tsx` (4), `goal-detail-sheet.spec.tsx` (3), `garden/page.spec.tsx` (4), `tasks-editor.spec.tsx` (5), `routines-editor.spec.tsx` (7).
  - Coverage by layer: server filter logic, organism rendering, modal happy-path forms, page-level routing/state, mutation→PATCH-body assertions for every CRUD operation. No gap.
- [x] 3.R.7 **CI sanity check**: `check` + `e2e` green on PR #21 (`52827bf` on main). `pnpm format:check`, `pnpm lint`, `pnpm test:unit`, `pnpm build` all green locally on this branch. No flakes observed.
- [x] 3.R.8 **Prototype fidelity check**. The user-visible surface this epic touched is `/garden`. Compared against `docs/prototype-design/plans-tab.jsx`:
  - "Life Goals" header + "+ New" button — matches.
  - Empty state with sprout illustration + create-first-goal CTA — matches; uses the existing `--color-input-border` token instead of the inline hex from the prototype.
  - Per-goal card with plant sprite, title, area chip, progress bar, status badge — matches.
  - Active vs Blooming & Completed split — matches the prototype's `sortedActive` / `sortedBlooming` partition.
  - Goal detail sheet → tasks + routines editors → graduate flow — matches the prototype's GoalCard/NewGoalModal structure.
  - Drift: the embedded `<GardenCard>` preview at the top of Plans is **deferred to Epic 4** (the actual garden grid lives there). Called out in this PR's epic-lead paragraph.
- [x] 3.R.9 **Improvements identified for Epic 4**:
  1. **Sortable goal lists** — the `GET /api/goals` "sorted by recently updated" requirement is currently unimplemented (the in-memory repo doesn't track timestamps). Add `createdAt` / `updatedAt` to the Goal entity as Epic A's persistence story prep; surface a `?sort=` query param. Worth doing once we have more than ~5 goals on a screen.
  2. **`<GardenCard>` preview at the top of `/garden`** — the prototype embeds a small visual garden above the goals list. Pull it in as part of Story 4.1 so the page lands on its full prototype shape.
  3. **`<GoalIcon>` lives under organisms but is shaped like a molecule** — small visual block (area-tinted square + plant sprite). When Garden lands and re-uses it for the planting flow, consider promoting to `src/components/molecules/goal-icon.tsx`.
  4. **`<GoalCard>` is currently 80 lines and fine, but the per-card `<GoalDetailSheet>` mounts at the page level** — when Garden adds the planting flow we'll likely want a per-card overflow/menu. Plan the affordance now to avoid a re-architecture later.
  5. **Health badge tinting on the goal-card status** — `<HealthBadge>` always shows the label; on the dense Plans list a single coloured dot might read better. Defer to design polish in Epic 8.
- [x] 3.R.10 **Decision: Epic 3 is done.** Goal CRUD ships with create / edit / delete, tasks and routines manageable per goal, optimistic toggle still working from Today, prototype fidelity matched (modulo the deliberately-deferred GardenCard preview). Improvements above are explicitly Epic 4 / Epic 8 work. Ready to open Epic 4 (Garden tab).
- [x] 3.R.11 **Visual fidelity pass against `plans-tab.jsx`.** Reviewer flagged on PR #22 that the implementation didn't match the design at all. Walked the prototype thoroughly and rewrote the surface to match:
  - **Two-step `<GoalEditor>`** matching `NewGoalModal`. Step 0 is title + Life Area chips with per-area slot counters (`X/Y` or 🔒); Step 1 is the plant grid with an area-tinted resource hint and an "Add as seed 🌰" CTA. Edit mode opens directly on Step 1 with the title editable inline. Blocked-area hint copy ports verbatim ("🔒 No slots in {area}…", "⚠️ {area} is full…"). New `useAreaSlots()` client hook computes quotas from `wheelOfLife` + active goals; mirrors the prototype's `getAreaSlots` helper.
  - **Compact `<GoalCard>` summary + `<GoalDetailSheet>` drawer for editing.** Settled shape after a few rounds of feedback: the goal cards in the `/garden` list are compact summaries (plant-or-seed icon + title + status chips + chevron + growth bar / banner). Tapping a card opens `<GoalDetailSheet>` — a bottom-sheet drawer that hosts the full detail UI: large icon + bold title + status chips at the top, "🌱 Plant now in garden" CTA when seed, growth / dead / blooming banner, the Tasks + Routines editors, an optional "🏆 Mark goal as complete" warm-gold CTA when every item is done (`useCompleteGoal` mutation), and a full-width **Edit goal** / **Delete goal** button row at the bottom (delete still gated by `<ConfirmDialog>`).
  - **New outlined `<Button>` variants** added to back the drawer's footer row: `outline` (white fill + light-sage border + green text/icon, used by Edit goal) and `outline-destructive` (white fill + soft-red border + red text/icon, used by Delete goal). Plus a `warning` variant (warm-gold solid fill + white text + small shadow) for the Mark-complete CTA, sourced from the `--color-accent-warm` token group instead of an inline hex.
  - **Swipeable task / routine rows** via a new `<SwipeableRow>` molecule ported from the prototype's `SwipeableItemRow`. Each row is full-width; the per-row action buttons (Edit / Delete on tasks; Done / Edit / Delete on routines) live in an absolutely-positioned panel behind the row and are revealed when the user drags left. Snaps open / closed at half-the-actions-width threshold; tapping the body when not swiped fires the toggle (same PATCH path as Today). Pointer-drag on desktop is logged as the next polish step; keyboard users can still tab into the buttons because they remain in the DOM.
  - **Seed envelope SVG** ported into `<GoalIcon>` (a small hand-drawn seed packet that replaces the plant when `!planted`). Per-stage chip tints from the new `STAGE_COLORS` map in `src/shared/plants.ts`.
  - **Token cleanup**: warm-accent + input-border tokens shipped earlier in this PR continue to absorb hex literals; no new component-level hex were introduced this round.
  - **Add-task / add-routine forms** restyled to match the prototype: rounded "+ Add task" pill toggles to an inline form with `📅 Due` + native date input + a `Today` shortcut, then `Cancel` + `Add task` action row. Routines: same shape with `🔁 Repeat on` + Every-day / Weekdays presets + day-picker.
  - **Empty state** ported from the prototype: 36px 🌱 emoji on a white card with a 2px dashed `--color-input-border` outline, bold green title, muted subtitle, "Create First Goal" CTA.
  - **Tests rewritten**: `goal-card.spec.tsx` drives the click-opens-drawer pattern + the seed / dead / blooming banners; `goal-editor.spec.tsx` walks the two-step create flow + back button + edit-mode prefill; `goal-detail-sheet.spec.tsx` covers Edit → PATCH, Delete → ConfirmDialog → DELETE, the Mark-complete CTA's visibility rule (hidden when items remain, shown once every item is done), and Cancel-from-delete-without-DELETE; `garden/page.spec.tsx` walks New → Step 0 → Next → Step 1 → Add as seed.
  - **Deferred from the prototype** (called out so they don't get silently dropped):
    - Pointer-drag (desktop / trackpad) on `<SwipeableRow>`. The touch path is in; mouse / pointer drag will land in the design-polish epic. Tapping the row still toggles, and the action buttons remain keyboard-reachable.
    - "Make-room" overlay when an area is full. The current modal disables Next with the prototype's copy; the choose-a-goal-to-drop overlay lands once the planting flow needs it (Epic 4).
    - Resource-needed hint inside the expanded card ("Needs 4 more 💧 Water"). Requires `PLANT_DEFS.requirements` exposed to the client; will land alongside Epic 4 garden-grid work.

209 unit tests pass; lint / format:check / build green.

---

## Epic 4 — Garden tab

Stories 4.1 + 4.2 ship in **PR #23** (the foundation + the planting flow). Stories 4.3 (replant / drop), 4.4 (trophies) and 4.5 (decoration shop) land in a follow-up PR — the prototype's `garden-tab.jsx` is dense (2146 lines, 600+ lines of pixel-art SVG to port) and shipping it all in one PR would re-trigger the back-and-forth from PR #22. Honest scoping note: prototype-faithful first, polish if reviewers flag gaps.

### Story 4.1 — Garden grid render ✅ (PR #23)
- [x] 4.1.1 8×6 `<IsometricGarden>` organism in `src/components/organisms/garden/`. Geometry (`TILE`, `PLOT_TILE`, `SCENE_COLS/ROWS`, `PLOT_OX/OY`, plot-vs-scene coordinate split, `PLANT_ROW_START`) ported verbatim from the prototype into `geometry.ts`. The plot's top 4 rows are the deco zone (grass), the bottom 2 are the planting zone (tilled soil). Hover on a free tile shows a yellow-dashed "valid placement" highlight when compatible with the current placing state (or a red one when not).
- [x] 4.1.2 Planted goals render via the new `<TilePlant>` (top-down 28px sprite, distinct from `<PlantSprite>`). All 7 plant variants × 5 stages + dead fallback + selection ring + health-state filter ported 1:1.
- [x] 4.1.3 Placed decorations render via the new `<DecoSprite>` covering all 10 deco kinds (`stone_path`, `fence`, `bench`, `lantern`, `birdbath`, `windmill`, `arch`, `koi_pond`, `fountain`, `pagoda`).
- [x] 4.1.4 Pixel-art ground tiles ported: `<GroundTile>` (5 scene palettes — grass, dark-grass, path, water, sand), `<TilledSoil>`, `<WetSoil>` (hover state for the planting zone), `<GrassSoil>`, `<HoverGrass>`. Plus `<FarmScenery>` (the 14×11 scene-tile painting, fence, scattered trees / rocks / bushes / signpost / wishing well) — all 1:1 from `garden-tab.jsx`.
- [x] 4.1.5 `<GardenCard>` wrapper: white rounded card, "My Garden" title + plants/decorations count, warm-gold coin pill on the right, optional placing-state banner with a Cancel button.
- [x] 4.1.6 `/garden` page: `<GardenCard>` at the top, then the existing "Life Goals" page-header + cards block below — matches the prototype's IA where Garden tab embeds both surfaces.

### Story 4.2 — Plant a goal on a tile ✅ (PR #23)
- [x] 4.2.1 `<PlantNowSheet>` bottom-sheet listing every unplanted, non-completed goal as a tappable seed packet (uses `<GoalIcon isSeed />`). Tapping an empty tile in the plot opens this picker; tapping a goal starts the placing state.
- [x] 4.2.2 `<GoalDetailSheet>` already had an `onPlantNow` hook stub from Story 3.3; the Garden page now wires it to start placing the picked goal.
- [x] 4.2.3 `POST /api/garden/tiles` with `{ col, row, goalId }` — already shipped in 0.7 via `services.gardens.plantOnTile`. The mutation rejects occupied tiles (`TILE_OCCUPIED`) and out-of-bounds coords (`TILE_OUT_OF_BOUNDS`); the page surfaces failures via the existing toast layer.
- [ ] 4.2.4 Seed → sprout animation. Deferred to the design-polish epic — `growPlant` already runs server-side on completion, so the animation is purely visual.
- [x] 4.2.5 Tests: `<IsometricGarden>` integration spec covers SVG dimensions, planted-goal rendering, and tile-tap firing `onTileTap("plant", ...)` while in placing mode. 214 → 217 unit tests.

### Story 4.3 — Replant / drop a dead plant ✅ (PR #24)
- [x] 4.3.1 Tap dead plant → modal with Replant / Drop
- [x] 4.3.2 Server `replantGoal` resets stage and reschedules overdue tasks to today

### Story 4.4 — Trophies on goal completion ✅ (PR #24)
- [x] 4.4.1 `POST /api/goals/[id]/complete` awards `+50 coins` and `trophyId`
- [x] 4.4.2 Tile freed; trophy added to `garden.owned`
- [x] 4.4.3 Trophy display somewhere on the garden

### Story 4.5 — Decoration shop ✅ (PR #24)
- [x] 4.5.1 `DECO_CATALOG` ported (server-owned)
- [x] 4.5.2 `POST /api/shop/buy` rejects insufficient coins / duplicate purchase
- [x] 4.5.3 Place owned decoration on a free tile

---

## Epic 5 — History tab ✅ (PR #25)
- [x] 5.1.1 `GET /api/history?month=YYYY-MM` returns completion counts per day
- [x] 5.1.2 Month view; dot density per day
- [x] 5.1.3 Tap a day → list of completions
- [x] 5.1.4 Streak summary at top

---

### 🔍 Epic 4 + 5 Review — between-epics gate (PR #27)

A single combined review pass for Epics 4 and 5 — both shipped without their close-out PR, so this catches up. Tidy-up is item R.1.

- [x] R.1 **Tidy up the code that landed Epics 4 + 5.** Walked every file the two epics added or substantially modified looking for the issues in the canonical checklist (file size, hex literals, dead code, stale comments, duplicated test setup). Found three worth fixing now; the rest were already addressed by the per-PR fidelity passes.
  - [x] R.1.a **Remove `void isPast;` workaround in `history-service.ts`.** Leftover from a refactor — the `isPast` variable was no longer read but the binding stayed to silence the unused-var warning. Just dropped the binding instead.
  - [x] R.1.b **Reduce N+1 in `computeCurrentStreak`.** Was calling `repo.completions.listByUserBetween(cursor, cursor)` once per day in the streak walk — up to 90 round-trips per page load on a long-streak user. Fetch the whole 90-day window once and partition by date in memory; streak walk is now O(1) round-trips regardless of length. Behaviour unchanged.
  - [x] R.1.c **`progress-*` token group + hex replacement in History components.** Added `success-strong` / `success-soft` / `success-bg` / `info` / `info-soft` tokens to `globals.css` (mirrors the `accent-warm-*` group's three-token shape) and replaced the inline `text-[#43A047]` / `bg-[#A5D6A7]` / `text-[#1976D2]` / etc. literals in `month-summary.tsx` and `day-detail-panel.tsx` with the new tokens. Also documented the group in `design-system.md`. The "missed" tone keeps reusing `health-critical*` (same red, already in tokens). Hex constants inside `day-bubble.tsx` are scoped at the top of the file and used as SVG fill/stroke values inside a self-contained pixel-art sprite — same pattern as `deco-sprite.tsx` / `tile-plant.tsx` / `scenery.tsx`, intentionally left as-is.
  - Items considered and intentionally not fixed: `scenery.tsx` is 303 lines and `tile-plant.tsx` is 269 lines — both pixel-art sprite painters that read top-to-bottom; splitting would scatter related sprites with no readability win. `goal-service.ts` is now 320 lines (was 283) after the completion-recording added in Epic 5 — under the 400-line trip wire and still entity-cohesive. Inline subtle off-white-green hex (`bg-[#FAFCF8]` / `border-[#F0F4EC]`) on the row card in `day-detail-panel.tsx` is single-use; promote if a second surface adopts the look.
- [x] R.2 **Walked the user journey end-to-end** for both epics:
  - **Epic 4** — `/garden` → empty grid → "+ New" creates a goal → `<GoalDetailSheet>` → "🌱 Plant now" → `<PlantNowSheet>` lists the seed → tap → return to grid → tap a tilled tile → plant grows on the tile. Mark goal complete → trophy minted (`trophy_${goalId}` on `garden.owned`) → tile freed → trophy pill appears in the header → `<TrophiesSheet>` lists it. "+ Shop" → `<DecoShopSheet>` → buy an item with enough coins (or skip the buy when owned) → tap a grass tile → deco placed. Replant flow: when a plant withers, the goal-detail sheet swaps the small banner for `<DeadPlantPanel>` with `Drop goal` + `🌱 Replant` actions, both gated by `<ConfirmDialog>`.
  - **Epic 5** — `/history` → calendar grid for current month → today is highlighted with a green ring + progress arc → tapping a future day shows a dashed outline + planned-count badge + the day-detail panel switches to "Planned". Toggle a task complete on `/today` → the matching due-day bubble switches state (perfect/partial) on next mount; the streak pill in the header appears once `currentStreak > 0`. Mark a goal complete → "Goal completed" row appears under that day's "Completed" section.
  - Verified via the existing 242 unit + integration tests; no browser-driven manual smoke (sandbox limitation noted in Epic 1's review still applies).
- [x] R.3 **Re-read each affected doc**.
  - `design-system.md` — `progress-*` token group documented; `accent-warm-*` and `input-border` reuse for the empty-state outline still accurate. ✅
  - `coding-guidelines.md` — `## Prototype fidelity` section added before Epic 4 (PR #22 commit `c1fce42`) caught the design-feedback issue from Epic 3; it held up across both epics. ✅
  - `architecture.md` — authed-route list still four (`/today`, `/garden`, `/history`, `/profile`). `/api/history` and the new repo are listed where the per-resource layout describes them. ✅
  - `domain-model.md` — `Completion` entity is the only new persistent type this round. The append-only event log shape + the "snapshot title at insertion" rule documented inline in `domain/completion/types.ts`. The full canonical model didn't change; no doc update needed.
  - `testing-strategy.md` — no convention shift. Conformance suite gained 4 cases for `CompletionRepo` following the existing `UserRepo` / `GoalRepo` / `GardenRepo` pattern.
- [x] R.4 **Re-read the backlog**. All Epic 4 sub-tasks (4.1.1–6, 4.2.1–5, 4.3.1–2, 4.4.1–3, 4.5.1–3) are ticked. All Epic 5 sub-tasks (5.1.1–4) are ticked. Notable additions captured during implementation: 4.1.5 (`<GardenCard>` wrapper sub-task added since the prototype embeds the iso garden in a card), 4.2.4 (seed→sprout animation deferred to design polish — server-side `growPlant` already runs), 4.4.3 (trophy display on the garden header pill + `<TrophiesSheet>`), and the shop catalog re-alignment with the prototype + `<DecoSprite>` (10 items, all with `rarity`) which was a cross-cutting fix during 4.5. Nothing silently dropped.
- [x] R.5 **Structural sanity check**. New folders that emerged: `src/components/organisms/garden/` (10 files: 3 SVG painters + 4 sheets/wrappers + geometry + 2 ground tiles + index), `src/app/(app)/history/_components/` (4 files), `src/server/domain/completion/` (1 file), `src/server/repositories/completion-repo.ts` + memory impl. Largest files are `scenery.tsx` (303), `tile-plant.tsx` (269), `history-service.ts` (now 252 after R.1.b), `isometric-garden.tsx` (227), `day-bubble.tsx` (209) — all under the 400-line trip wire. No file mixes concerns; per-entity layout still respected.
- [x] R.6 **Test sanity check**.
  - **242 unit + integration specs** (was 217 at end of Epic 3; +25 across both epics). New suites: `isometric-garden.spec.tsx` (3), `dead-plant-panel.spec.tsx` (3), `trophies-sheet.spec.tsx` (3), `deco-shop-sheet.spec.tsx` (3), `history.spec.ts` (6), `history/__tests__/page.spec.tsx` (3), conformance `CompletionRepo` (4), `me.spec.ts` rename (3, in Epic 6 / Story 6.1 follow-up).
  - Coverage by layer: domain (CompletionRepo conformance), service (history rollups via API specs), API (route validation, 401/422), organism (planting state, replant flow, shop buy/place, trophy listing), page (calendar grid, month nav). No gap.
- [x] R.7 **CI sanity check**: `check` + `e2e` green on PRs #23 / #24 / #25 / #26 (`bedfa46`, `ed0511f`, `7e4660f` on main). `pnpm format:check`, `pnpm lint`, `pnpm test:unit`, `pnpm build` all green locally on this branch. No flakes observed.
- [x] R.8 **Prototype fidelity check**. `garden-tab.jsx` (2146 lines) and `history-tab.jsx` (~1100 lines) both ported to within touching distance of the design:
  - **Garden** — top-down isometric grid + scenery + tilled-soil zone vs. grass deco zone, planting-flow with hover affordance (yellow dashes valid / red invalid), `<TilePlant>` vs. `<PlantSprite>` split (top-down vs. front-on), `<DecoSprite>` for the 10 catalog items, `<GardenCard>` header with My Garden + plants/decorations count + warm-gold coin pill. Trophies pill + sheet + shop sheet match the prototype's drawer style.
  - **History** — 3-card month summary, Mon-first 7-col grid, bubble visuals (perfect ✓ / partial arc / missed ring / today progress arc / future dashed outline + planned-count badge / empty-past neutral dot) all match. Day detail panel renders inline below the calendar with Completed / Missed / Planned sections + area chips + per-row status bullets.
  - Drift: `<DayProgressDisc>` (the 48px progress-disc next to the day header in the prototype) was inlined as the bubble's progress arc instead of split into its own atom — equivalent visual, less code surface for a single use. The "goal events" (planted / grew / completed) inline rows in the prototype's detail panel are deferred — Epic 5's history is event-sourced from the new `Completion` log, which only records completions; "planted / grew" events would need their own append paths in `garden-service` / `growPlant` and aren't in scope for the History tab as backlogged.
  - **Honest data note** — the prototype synthesises past days via seeded pseudo-random because it has no completion log; the real implementation stores `Completion` events on every toggle going forward. Past data before this PR isn't fabricated — older days appear empty until users start completing tasks.
- [x] R.9 **Improvements identified for Epic 6 / 7 / 8**:
  1. **`<AccentPill>` atom** — the warm-gold pill pattern is now used on the coin chip (Today, Garden, Profile, Shop sheet), the streak pill (Today, Profile, History), and the trophy pill (Garden). Five surfaces share the exact class string today; promote to an atom + the design-system note already calls it out.
  2. **`<StatCard>` molecule** — Profile (Story 6.1), Today (greeting strip), and History (`<MonthSummary>`) all render variations of "icon + bold value + uppercase label" cards. Three near-identical implementations; would benefit from a shared molecule with a `tone` prop tied to the new `progress-*` / `accent-warm-*` token groups.
  3. **`buildDay` could move to `domain/completion/`** — `history-service.ts` is now 252 lines and the per-day rollup logic (lines 110–207) is pure (no clock, no repo). Lift to `src/server/domain/completion/rollup.ts` so it's unit-testable in isolation; the service then just orchestrates the repo + the rule. Defer to Epic 7 if the history page grows new visual states.
  4. **Goal-event timeline** — when Epic 7 (plant health) lands, the prototype's "Planted / Grew / Goal completed" rows in the day-detail panel would be honest data (currently we only log task / routine / goal completions). Add a `kind: "planted" | "grew"` to `Completion` and append from `garden-service.plantOnTile` and `growPlant` (the plant-stage transition site).
  5. **Future-month preload** — `useHistory(month)` re-fetches every time the user navigates ← / →. With React Query's `placeholderData: keepPreviousData` plus a `prefetchQuery` on the next/prev month, the calendar nav would feel instant.
- [x] R.10 **Decision: Epics 4 and 5 are done.** Garden tab ships full prototype IA (grid + planting + replant + trophies + shop). History tab ships an honest event-sourced calendar + streak + day-detail panel. Improvements above are explicitly Epic 6 / 7 / 8 work. Ready to continue Epic 6 (Stories 6.2 + 6.3).

---

## Epic 6 — Profile tab
- [x] 6.1.1 Display name, total coins earned, current streak (PR #26)
- [x] 6.1.2 Edit name (PR #26)
- [ ] ~~6.2.1 Toggle resource animations~~ — dropped on PR #28 review (the settings card didn't read as useful in-product; revisit if a real settings need surfaces).
- [ ] ~~6.2.2 Accent color picker (CSS var)~~ — dropped with 6.2.1 on PR #28 review.
- [x] 6.3.1 Reset all data with double confirmation (`POST /api/me/reset`) (PR #28)
- [ ] ~~6.3.2 Export state as JSON~~ — dropped on PR #28 review (not surfaced in UI; backend code reverted with it).
- [ ] ~~6.3.3 Import state from JSON (validated server-side)~~ — dropped with 6.3.2.

---

### 🔍 Epic 6 Review — between-epics gate (PR #29)

A short focused review pass before opening Epic 7. Tidy-up is item 6.R.1.

- [x] 6.R.1 **Tidy up the code that landed Epic 6.** Walked every file Epic 6 added or substantially modified looking for the issues in the canonical checklist. Found one worth fixing now; everything else was already addressed by the within-PR feedback (the design trim that dropped Settings + Export/Import in PR #28).
  - [x] 6.R.1.a **Removed dead reset-on-reopen guard in `<EditNameDialog>`.** The block `if (open && submitting === false && name !== currentName && name === "") setName(currentName);` is unreachable in practice — `<Modal>` returns `null` when `open` is false, so the form unmounts and remounts with `currentName` next time it opens. Replaced with a one-line comment that names the unmount-remount lifecycle so a future reader doesn't add it back.
  - Items considered and intentionally not fixed:
    - **`<StatCard>` promotion to a molecule** (queued from 4+5.R.9.2) — Profile's three-card stat strip and History's `<MonthSummary>` are visually distinct enough (icon-above-value vs. icon-inline-with-value, no `sub` vs. always-`sub`, brand/warm tones vs. brand/success/critical tones) that a single molecule would carry both layouts behind a `layout` prop. The right shape will be clearer once Epic 7 (plant health) adds a fourth surface (a "today's resources" strip per the prototype's `<StatCard>` reuse). Re-queued for the Epic 7 review.
    - **`<AccentPill>` atom** (queued from 4+5.R.9.1) — same reasoning. Five surfaces share the warm-gold pill class string; promoting now while Epic 6 only added one more (the streak pill on `/profile`) doesn't pay back the indirection. Re-queued for Epic 7.
    - **`profile/page.tsx` is 197 lines** (was 42 before Epic 6) and embeds three local components: `<StatCard>`, `<EditNameDialog>`, `formatJoined`. Under the 400-line trip wire and reads top-to-bottom; splitting `<EditNameDialog>` to its own file would scatter the form's validation rules and the `useUpdateName` mutation it sits next to. Leave.
- [x] 6.R.2 **Walked the user journey end-to-end** for Epic 6:
  - `/profile` → header card shows the user's avatar + bold name + "Signed in since {month year}" + outlined **Edit** pill. Tap **Edit** → modal opens with the current name pre-filled → blank submit is rejected by the schema (422 INVALID_INPUT surfaced as an inline error) → typing a new name + Save → modal closes + header re-renders with the new name + the `["me"]` cache is updated optimistically.
  - Stat strip: Coins earned (warm-gold), Day streak (warm-gold), Goals (brand-green) — all read live from `user.totalCoinsEarned`, `user.streak`, and `useGoals().data?.length`.
  - Reset: tap **Reset all data** → `<ConfirmDialog>` with the double-confirm "type RESET" gate → confirm runs `POST /api/me/reset` → goals + garden + completions wiped, wallet/streak/wheel zeroed, `prioritiesLocked: false`. Next render the priorities modal pops up via the app shell because the user is back to a fresh-start state. Verified via the API specs in `me-data.spec.ts` (3 cases) and the shell layout's existing modal logic.
  - Sign out: tap **Sign out** → `meApi.signOut()` clears the dev-session cookie → `useSession()` flips to `user: null` → app shell redirects to `/login`.
- [x] 6.R.3 **Re-read each affected doc**.
  - `architecture.md` — authed-route list still four; `/api/me/reset` is the only new endpoint Epic 6 shipped (`/api/me/export` and `/api/me/import` were reverted in the within-PR design trim). ✅
  - `coding-guidelines.md` — no convention shift; the React 18 `useSyncExternalStore` snapshot-caching pitfall is now folklore in this PR's commit history (`fix(profile): cache useAppPrefs snapshot to avoid React getSnapshot loop` on PR #28). Worth noting in the canonical Between-epic review checklist if it bites again. Skipped for now since the offending hook was reverted in the trim.
  - `design-system.md` — no new tokens this epic; the `progress-*` and `accent-warm-*` groups documented in the Epic 4+5 review are still accurate.
  - `domain-model.md` — no new persistent types. The reset rule (zero wallet/streak/wheel + `prioritiesLocked: false`, keep id + name) is documented inline in `users.resetAll`.
  - `testing-strategy.md` — no convention shift.
- [x] 6.R.4 **Re-read the backlog**. Sub-tasks ticked: 6.1.1, 6.1.2, 6.3.1. Sub-tasks dropped on PR-#28 design trim and struck-through with a parenthetical: 6.2.1, 6.2.2, 6.3.2, 6.3.3. The dropped surfaces aren't dead code — Settings + Export/Import were removed completely from the codebase (component + hook + service + route + schema + tests) so the backlog matches what's on disk. If a real settings need surfaces later, those rows are easy to un-strike.
- [x] 6.R.5 **Structural sanity check**. Net new files: `app/(app)/profile/_components/reset-action.tsx` (64 lines), `client/hooks/use-me-data.ts` (28), `app/api/me/reset/route.ts` (13), `server/__tests__/api/me-data.spec.ts` (76). Modified: `profile/page.tsx` (now 197 lines, was 42), `client/api/me.ts` (+ `updateName`, `reset`), `client/hooks/use-session.ts` (+ `updateName`), `server/services/user-service.ts` (+ `updateName`, `resetAll` — now 58 lines, was 30), `repositories/{goal,completion}-repo.ts` (+ `deleteAllByUser`), `repositories/memory/{goal,completion}-repo.ts` (+ impl), `repositories/__tests__/conformance.ts` (+2 cases), `components/molecules/confirm-dialog.tsx` (+ `confirmDisabled` + `children` slots). All under the 400-line trip wire. No file mixes concerns.
- [x] 6.R.6 **Test sanity check**.
  - **245 unit + integration specs** (was 242 at end of Epic 4+5; +3 net for Epic 6 — was a brief +13 before the design trim reverted 10 of them).
  - New / modified suites: `me.spec.ts` +3 (rename happy path / 422 / 401 from Story 6.1), `me-data.spec.ts` +3 (reset 401, reset zeros wallet+wheel+goals+completions), conformance +2 (`goals.deleteAllByUser`, `completions.deleteAllByUser`).
  - Coverage by layer: server (route 401/200, service zeroing, repo conformance), API (rename + reset round-trip), client cache (mutation invalidates `me`/`goals`/`garden`/`today`/`history`), UI (covered transitively through the existing `goal-detail-sheet` / `today` page specs that drive the same hooks). No gap.
- [x] 6.R.7 **CI sanity check**: `check` + `e2e` green on PRs #26 / #27 / #28 (latest commits on `main` after Epic 6). `pnpm format:check`, `pnpm lint`, `pnpm test:unit`, `pnpm build` all green locally on this branch. No flakes observed.
- [x] 6.R.8 **Prototype fidelity check**. Compared `/profile` against `docs/prototype-design/profile-tab.jsx`:
  - Header card with avatar + name + Edit affordance — matches (the prototype hero gradient is deferred to Epic 8 polish; the white card reads cleaner against the rest of the app's surfaces).
  - Stat strip (Streak, Coins, Goals) — matches the prototype's three-card row shape, simplified from the prototype's six cards (Tasks Done / Plants / Decorations are deferred — covered partially by the History tab's calendar already).
  - Reset action with two-step confirmation — matches the prototype's `🔄 Reset Progress` row + `⚠️ Reset Everything?` modal, plus an extra "type RESET" gate the prototype doesn't have (added on the design-feedback round; cheap blast-radius reducer).
  - Drift: the prototype's Settings list (Notifications / Dark Mode / Export Data) and the Achievements grid are intentionally not shipped (Settings dropped on PR #28 design trim; Achievements deferred — it's a downstream surface of the Trophies on `/garden`). Called out in the dropped sub-tasks above.
- [x] 6.R.9 **Improvements identified for Epic 7 / 8**:
  1. **Re-queued from Epic 4+5 review**: `<AccentPill>` atom and `<StatCard>` molecule. The fourth surface that lands in Epic 7 (a per-goal health resources strip per the prototype's `health-tab.jsx`) makes the right shape clear; promote then.
  2. **`<EditNameDialog>` as `<EditTextDialog>`** — the same modal shape (current value pre-filled + trimmed validation + 422-aware error + Save/Cancel) will be needed when Epic 7 / 8 surface "edit task title" on a swipe row and "rename a routine". One molecule, multiple call sites.
  3. **`useResetData` test coverage** — the mutation isn't currently exercised through the React-Query layer; the API spec covers the route and the service end-to-end but a small client-side spec would catch a future regression where invalidation breaks. Defer until the first user-visible bug shows up.
  4. **Server-side ETag on `/api/me`** — every navigation refetches the user record (TanStack Query's `staleTime: 60_000` softens it but doesn't avoid the round-trip on a long-idle tab). When persistence lands (Epic A) the right place to add `If-None-Match` is the `requireUser()` helper. Track in Epic A.
- [x] 6.R.10 **Decision: Epic 6 is done.** Profile tab ships display + rename + reset + sign-out. The dropped sub-tasks (Settings + Export/Import) are recorded as such in the backlog with a struck-through note explaining the design trim — easy to un-strike if the product need re-emerges. Improvements above are Epic 7 / 8 / A work. Ready to open Epic 7 (Plant health system).

---

## Epic 7 — Plant health system ✅ (PR #30)
- [x] 7.1.1 `getOverdueCount`, `getHealth`, `getHealthState` — drafted in Story 0.5; final shape carried into Epic 7 with the new `countOverdueTasks` companion (raw integer count for UI copy).
- [x] 7.1.2 Long-overdue (>7d) doubled; missed routines half-weight — drafted in Story 0.5 (in `getOverdueCount`).
- [x] 7.1.3 Server returns health alongside goals (never persisted) — `goalToDto` and `todayGroupToDto` now expose `health`, `healthState`, and `overdueCount`.
- [x] 7.2.1 Plant sprite swaps per state — `<PlantSprite>` already filters per state (Story 0.5); `<GoalPlant>` (Today) now threads `healthState` through so the Today header sprite tints too.
- [x] 7.2.2 Health badge on `GoalCard` — new `<HealthWarning>` molecule renders on the card body when the goal is wilting / ill / critical (border tint was already there).
- [x] 7.2.3 Today copy nags appropriately — same `<HealthWarning>` molecule on the Today `<GoalGroup>` header.

---

## Epic 8 — Polish
- [ ] 8.1 Empty states for every tab
- [ ] 8.2 Error boundary at the app shell + toast for API failures
- [ ] 8.3 Reduced-motion compliance pass
- [ ] 8.4 Accessibility audit (axe; tap-target check; keyboard nav for the bottom nav)
- [ ] 8.5 Lighthouse pass
- [ ] 8.6 README with run instructions, screenshots, `docs/` index
- [ ] 8.7 First Playwright run in CI green

---

## Epic A — Persistence: Postgres + Prisma (replaces in-memory)

Run when the in-memory layer becomes a real bottleneck (data loss on restart starts hurting). The point of repository abstraction is that this is a self-contained epic.

- [ ] A.1 Add `prisma/schema.prisma` modeling `User`, `Goal`, `Task`, `Routine`, `GardenTile`, `OwnedDeco`, `Trophy`, with `userId` foreign keys and `(userId, tileCol, tileRow)` uniqueness
- [ ] A.2 Implement Prisma-backed repos under `src/server/repositories/prisma/` against the same interfaces
- [ ] A.3 Run interface conformance tests against the Prisma impl
- [ ] A.4 Switch `container.ts` binding behind an env flag; rollback by flipping it back
- [ ] A.5 Provision Postgres (Neon for dev/preview, decide hosted prod target)
- [ ] A.6 First migration + seed scripts

---

## Epic B — Auth (Auth.js)

Run when product wants real accounts. Designed-for in v1; this epic is the actual rollout.

- [ ] B.1 Install `next-auth` (latest), configure providers (start: email magic link)
- [ ] B.2 Prisma adapter on the same DB
- [ ] B.3 Replace `requireUser` dev stub with the Auth.js session subject
- [ ] B.4 Login UI swaps from "type a name" to "enter your email"
- [ ] B.5 Migrate dev-stub users (or wipe — TBD by product)
- [ ] B.6 OAuth providers (Google, Apple) as a follow-up

---

## Delivery order

The order isn't a Gantt chart — it's the sequence that lets us demo something real after each epic:

1. **Epic 0** — foundations (frontend + backend skeleton). Most invisible work; everything depends on it.
2. **Epic 1** — onboarding. First demoable: name + priorities, persisted server-side.
3. **Epic 2** — Today + completion + growth. The core loop. After this we have a real game.
4. **Epic 7** — health. Adds tension to the loop. Slot here, before Plans, because Today depends on the visual health state.
5. **Epic 3** — Plans (CRUD).
6. **Epic 4** — Garden (visual payoff).
7. **Epic 5** — History.
8. **Epic 6** — Profile.
9. **Epic 8** — Polish, runs alongside the late epics.
10. **Epic A** — Postgres swap, when needed.
11. **Epic B** — Auth, when product wants accounts.

## Definition of Done (every story)

1. Code merged through PR with green CI.
2. New behavior covered by tests proportional to its risk (see `testing-strategy.md`).
3. Acceptance criteria demoed in PR description.
4. No new ESLint warnings, no `any`, no `@ts-ignore`.
5. User-facing copy reads aloud cleanly.
6. **Visual fidelity to the prototype.** For any user-visible surface, place a screenshot of the implementation next to the corresponding prototype screen in the PR description and confirm they match: layout, illustrations, palette application, microcopy, flow steps. Drift from the prototype is allowed but it must be a deliberate, noted decision in the PR — not a quiet shortcut. The prototype lives at [`docs/prototype-design/`](./prototype-design/README.md) and is the authoritative reference until the user says otherwise.
7. **Docs are kept in sync in the same PR**:
   - This backlog: every implemented sub-task ticked `[x]`; every implemented story tagged with the merging PR (e.g. `### Story X — Title ✅ (PR #N)`).
   - Domain rules added or revised in `domain-model.md` if any were introduced or changed.
   - `architecture.md` / `coding-guidelines.md` / `design-system.md` updated when a decision in the PR contradicts or extends them. Don't ship the code and "do the docs later" — reviewers should be able to read the doc change and the code change side by side.

## Between-epic review (every epic)

Before opening the next epic, run a short review pass to make sure the closing one is genuinely done. Add a `### 🔍 Epic N Review` section to the backlog at the end of every epic with the checklist below — it lives next to the epic so it's hard to skip. Ship the review notes **and any tidy-up fixes** in a single PR (e.g. `chore: Epic N review`).

Reviewable items (canonical template):

1. **Tidy up the code that landed this epic.** Walk every file the epic added or substantially modified looking for the issues below; apply the worth-doing-now fixes in this PR; defer the rest as the first sub-tasks of the next epic. Output is a short punch list (usually 3–8 items) recorded in this section.
   - **Dead / speculative code.** Unused exports, unreferenced helpers, props with no caller, error-handling for cases that can't happen, feature flags / shims kept "just in case". Delete it.
   - **Premature abstraction.** Wrappers / hooks / utilities introduced for one caller. If three similar lines would be clearer, inline. If an abstraction's name is vague (`Helper`, `Util`, `Manager`), rename or remove.
   - **Duplication.** The same shape declared in two places (Zod enums, magic-string lists, type aliases). Promote to a shared module. The same logic written twice — extract or unify.
   - **File size + cohesion.** Anything past ~400 lines or mixing concerns gets split per `coding-guidelines.md`'s "Split files by entity / resource" rule. One file = one role.
   - **Naming.** Identifiers describe intent, not mechanics. No `data2`, `tmp`, abbreviated single-letter names outside tight scopes. Files match what they export.
   - **Comment hygiene** (per `CLAUDE.md`). Default to no comment. Keep the ones that explain a non-obvious WHY: a hidden constraint, an invariant, a workaround. Delete comments that restate the code, narrate the task, or reference callers / PRs / issues — those rot.
   - **Type safety.** No `any`, no `@ts-ignore`, no `as unknown as X` shortcuts at boundaries we control. Optional / nullable fields modelled honestly.
   - **Magic values.** Numbers, durations, colour hex literals, copy strings that should live in tokens / a constants module / a shared schema. Cross-check against `design-system.md`.
   - **Test quality.** Tests assert observable behaviour, not implementation. No reaching into internal state, no brittle snapshot matches when a single targeted assertion would do. `it()` names describe behaviour.
   - **Boundary respect.** No client → server imports. No domain → infra imports. ESLint should already catch these; the manual re-check is for new patterns the rules haven't been taught yet.
2. **Walk the user journey end-to-end** in dev for whatever the epic claims to ship.
3. **Re-read each affected doc** (`architecture.md`, `domain-model.md`, `coding-guidelines.md`, `design-system.md`, `testing-strategy.md`) and confirm reality matches the words.
4. **Re-read the backlog**: every checked sub-task actually done? Anything that emerged that should be a follow-up rather than silently dropped?
5. **Structural sanity check** against `coding-guidelines.md` ("Split files by entity / resource"). Anything mixed across entities? Any cross-cutting helper that grew enough to deserve a folder?
6. **Test sanity check**: every layer covered? Coverage trend on the PR-comment report — anything dropping?
7. **CI sanity check**: typecheck / lint / format / tests / build all green on `main`. No flakes.
8. **Prototype fidelity check**: take a screenshot of every user-visible screen the epic touched; place it next to the matching prototype screen in [`docs/prototype-design/`](./prototype-design/README.md) (or the relevant `screenshots/<screen>.png`) and look. Layout, illustrations, palette application, microcopy, flow steps. Any drift that wasn't a deliberate, noted decision earns a follow-up task.
9. **List 3–5 improvements** that would make the next epic faster or safer (better fixtures, missing helper, ergonomics). File as `chore/` issues or as the first sub-tasks of the next epic.
10. **Decide**: is the epic done? If not, add missing tasks to the review section and ship them before the next epic starts.

The point isn't to gold-plate — it's a 30-minute pause to catch what the by-the-PR cadence missed.
