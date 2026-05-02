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

### Story 2.3 — Plant growth on completion
- [ ] 2.3.1 Server applies `growPlant` after every resource change; returns new stage
- [ ] 2.3.2 Stage-transition animation in the goal card
- [ ] 2.3.3 Tests covering each of the 4 stage transitions

---

## Epic 3 — Plans tab

### Story 3.1 — Goals list
- [ ] 3.1.1 `GET /api/goals` (filters: area, status); sorted by recently updated
- [ ] 3.1.2 `GoalCard` organism with title, area, plant emoji, progress, health badge

### Story 3.2 — Create goal
- [ ] 3.2.1 `GoalEditor` modal: title, area, plant kind (defaults from area)
- [ ] 3.2.2 `POST /api/goals`; new goals start unplanted (`stage:0`)

### Story 3.3 — Edit / delete goal
- [ ] 3.3.1 `PATCH /api/goals/[id]`, `DELETE /api/goals/[id]`
- [ ] 3.3.2 Confirmation dialog on delete (destructive)
- [ ] 3.3.3 Delete frees the tile (server handles via service)

### Story 3.4 — Tasks within a goal
- [ ] 3.4.1 Add / edit / delete; due-date picker
- [ ] 3.4.2 Inline checkbox toggle (same endpoint as Today)

### Story 3.5 — Routines within a goal
- [ ] 3.5.1 Add / edit / delete; repeat-day picker
- [ ] 3.5.2 Mark routine permanently complete
- [ ] 3.5.3 Streak displays correctly

---

## Epic 4 — Garden tab

### Story 4.1 — Garden grid render
- [ ] 4.1.1 `GardenGrid` 8×6 (locked); terrain map (plantable / non-plantable)
- [ ] 4.1.2 Render planted goals as `PlantSprite` per stage + health
- [ ] 4.1.3 Render placed decorations

### Story 4.2 — Plant a goal on a tile
- [ ] 4.2.1 Tap empty tile → "Pick a goal to plant" sheet listing unplanted goals
- [ ] 4.2.2 `POST /api/garden/tiles` with `(col, row, goalId)`; rejects occupied tiles (DB-level uniqueness later)
- [ ] 4.2.3 Animation: seed → sprout

### Story 4.3 — Replant / drop a dead plant
- [ ] 4.3.1 Tap dead plant → modal with Replant / Drop
- [ ] 4.3.2 Server `replantGoal` resets stage and reschedules overdue tasks to today

### Story 4.4 — Trophies on goal completion
- [ ] 4.4.1 `POST /api/goals/[id]/complete` awards `+50 coins` and `trophyId`
- [ ] 4.4.2 Tile freed; trophy added to `garden.owned`
- [ ] 4.4.3 Trophy display somewhere on the garden

### Story 4.5 — Decoration shop
- [ ] 4.5.1 `DECO_CATALOG` ported (server-owned)
- [ ] 4.5.2 `POST /api/shop/buy` rejects insufficient coins / duplicate purchase
- [ ] 4.5.3 Place owned decoration on a free tile

---

## Epic 5 — History tab
- [ ] 5.1.1 `GET /api/history?month=YYYY-MM` returns completion counts per day
- [ ] 5.1.2 Month view; dot density per day
- [ ] 5.1.3 Tap a day → list of completions
- [ ] 5.1.4 Streak summary at top

---

## Epic 6 — Profile tab
- [ ] 6.1.1 Display name, total coins earned, current streak
- [ ] 6.1.2 Edit name
- [ ] 6.2.1 Toggle resource animations
- [ ] 6.2.2 Accent color picker (CSS var)
- [ ] 6.3.1 Reset all data with double confirmation (`POST /api/me/reset`)
- [ ] 6.3.2 Export state as JSON
- [ ] 6.3.3 Import state from JSON (validated server-side)

---

## Epic 7 — Plant health system
- [ ] 7.1.1 `getOverdueCount`, `getHealth`, `getHealthState` (already drafted in 0.5)
- [ ] 7.1.2 Long-overdue (>7d) doubled; missed routines half-weight
- [ ] 7.1.3 Server returns health alongside goals (never persisted)
- [ ] 7.2.1 Plant sprite swaps per state
- [ ] 7.2.2 Health badge on `GoalCard`
- [ ] 7.2.3 Today copy nags appropriately

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

Before opening the next epic, run a short review pass to make sure the closing one is genuinely done. Add a `### 🔍 Epic N Review` section to the backlog at the end of every epic with the checklist below — it lives next to the epic so it's hard to skip.

Reviewable items (canonical template):

1. **Walk the user journey end-to-end** in dev for whatever the epic claims to ship.
2. **Re-read each affected doc** (`architecture.md`, `domain-model.md`, `coding-guidelines.md`, `design-system.md`, `testing-strategy.md`) and confirm reality matches the words.
3. **Re-read the backlog**: every checked sub-task actually done? Anything that emerged that should be a follow-up rather than silently dropped?
4. **Structural sanity check** against `coding-guidelines.md` ("Split files by entity / resource"). Anything mixed across entities? Any cross-cutting helper that grew enough to deserve a folder?
5. **Test sanity check**: every layer covered? Coverage trend on the PR-comment report — anything dropping?
6. **CI sanity check**: typecheck / lint / format / tests / build all green on `main`. No flakes.
7. **Prototype fidelity check**: take a screenshot of every user-visible screen the epic touched; place it next to the matching prototype screen in [`docs/prototype-design/`](./prototype-design/README.md) (or the relevant `screenshots/<screen>.png`) and look. Layout, illustrations, palette application, microcopy, flow steps. Any drift that wasn't a deliberate, noted decision earns a follow-up task.
8. **List 3–5 improvements** that would make the next epic faster or safer (better fixtures, missing helper, ergonomics). File as `chore/` issues or as the first sub-tasks of the next epic.
9. **Decide**: is the epic done? If not, add missing tasks to the review section and ship them before the next epic starts.

The point isn't to gold-plate — it's a 30-minute pause to catch what the by-the-PR cadence missed.
