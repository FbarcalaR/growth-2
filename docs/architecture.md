# Growth — Architecture

## 1. What we're building

**Growth** is a mobile-first, single-user, gamified life planner. The user defines life priorities across seven areas (the Wheel of Life), creates goals tied to those areas, and each goal is represented by a plant in a garden. Tasks and routines feed resources to the plant; overdue work wilts it; finishing a goal earns a trophy. The whole thing is a single React app rendered inside a simulated iOS frame — there's no real backend, no auth, no multi-user concerns at v1.

This document explains how the codebase is organized, why, and where to push back if a future requirement breaks the assumption.

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | The user asked for Next.js. App Router gives us file-based routing for the few full-page surfaces we have (login, app shell), RSC where useful, and a clean path to add a real backend later (route handlers / server actions). |
| Language | **TypeScript (strict)** | The prototype uses dynamic JS and gets away with it because it's small. Once we model goals/tasks/plants/resources as real types, the compiler catches the bugs we'd otherwise hit at runtime (e.g. resource keys, plant stages). |
| UI | **React 18** | Matches the prototype. |
| Styling | **Tailwind CSS + CSS variables for tokens** | The prototype uses inline styles tied to a small set of color/spacing tokens. Tailwind keeps colocation and lets us encode the tokens (sage greens, area colors, resource colors) once in `tailwind.config.ts` + `globals.css`. We avoid CSS-in-JS — no runtime cost, simpler SSR. |
| State | **Zustand** with `persist` middleware | The prototype is one big `useReducer` + `localStorage`. Zustand gives us the same shape (single store, plain actions) without prop-drilling `dispatch`, plays nicely with selectors, and `persist` replaces the hand-rolled `loadState`/`saveState`/`migrateState`. We considered Redux Toolkit (too much ceremony for one user) and React Context + reducer (works but selectors and persistence get awkward). |
| Forms | **React Hook Form + Zod** | Goal/task creation modals have validation rules (non-empty title, valid date, repeat-day mask). Zod schemas double as the runtime validators at the persistence boundary (see §6). |
| Tests | **Vitest + React Testing Library + Playwright** | Vitest is fast, ESM-native, and pairs with Next 15. RTL for component behavior; Playwright for the few flows that span tabs (plant a goal, complete a task, watch the plant grow). |
| Icons / SVG | Inline SVG components | The prototype hand-draws icons inline. We'll lift them to `components/icons/` so they're reusable and themable. |
| Fonts | Plus Jakarta Sans via `next/font` | Self-hosted, no FOUT, matches the prototype. |
| Lint/format | ESLint (next config) + Prettier + `tsc --noEmit` in CI | Standard. |

### Things we explicitly are not adding (yet)

- A backend, database, or auth — the app is local-only, just like the prototype. We persist to `localStorage` under a versioned key (`growth_v1`).
- A component library (MUI, shadcn, etc.) — the visual language is specific enough that wrapping a generic library costs more than it saves.
- Internationalization — single-locale (en-US) until product asks otherwise.
- Server state libraries (React Query, SWR) — there's no server.

When any of those assumptions breaks (we add sync, we add accounts, we add a second locale), revisit this section before adding the dependency.

## 3. Architectural style: light DDD, not full DDD

Should we implement DDD? **Partially.** Here's the reasoning.

The app has a real domain — Goal, Task, Routine, Plant, Resource, Garden — with non-trivial rules: a plant grows when it has accumulated enough of its primary and secondary resources; a plant's health is derived from the count and age of overdue tasks; completing a goal awards a trophy and frees its tile. Those rules deserve to live in pure functions that are easy to test in isolation, not be smeared across React components.

What we **adopt** from DDD:

- A **`domain/` layer** of pure TypeScript: entities as types, business rules as pure functions (`growPlant`, `getOverdueCount`, `getHealth`, `applyTaskCompletion`). No React, no localStorage, no `Date.now()` passed in (clock injected). Easy to unit-test.
- **Ubiquitous language**: code uses the same words the user sees — `goal`, `task`, `routine`, `plant`, `resource`, `area`, `tile`, `decoration`. No `Item`/`Entity`/`Record` placeholders.
- **Invariants enforced in one place**: e.g. "you can't plant two goals on the same tile" lives in a domain function, not in the dispatch handler.

What we **don't** adopt:

- **No aggregates / repositories / CQRS.** There's one user, one store, one persistence target. Adding a `GoalRepository` interface in front of `localStorage` is ceremony for a problem we don't have.
- **No bounded contexts.** The whole app is one context.
- **No domain events / event sourcing.** We mutate a single state tree. Animations driven by "X just happened" can be modeled as transient UI state, not a sourced event log.

If the app gains real persistence (sync server, multi-device), the `domain/` layer is already isolated enough that we can put a repository in front of it without rewriting components. That's the migration we're protecting.

## 4. Folder structure

```
growth-2/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout: fonts, theme, persisted store hydration
│   ├── page.tsx                  # The single app shell (iOS frame + active tab)
│   ├── login/                    # If we choose a separate route for login
│   └── api/                      # (empty for v1; reserved)
│
├── src/
│   ├── domain/                   # Pure TS, no React, no DOM
│   │   ├── types.ts              # Goal, Task, Routine, Plant, Resource, Area, GardenState
│   │   ├── areas.ts              # WHEEL_AREAS, AREA_RESOURCE
│   │   ├── plants.ts             # PLANT_DEFS, STAGE_NAMES, growPlant(), getStage()
│   │   ├── resources.ts          # RESOURCE_INFO, applyResourceDelta()
│   │   ├── health.ts             # getOverdueCount(), getHealth(), getHealthState()
│   │   ├── rewards.ts            # task/routine completion → coins + resources
│   │   ├── garden.ts             # tile occupancy, placeDeco, isPlantable
│   │   └── __tests__/            # Vitest specs colocated with the layer they test
│   │
│   ├── store/                    # Zustand store + actions (the only mutator)
│   │   ├── index.ts              # createStore() with persist middleware
│   │   ├── actions.ts            # Each action calls into domain/ for the math
│   │   ├── migrations.ts         # Versioned migrations (v1 → v2 → ...)
│   │   └── selectors.ts          # Reusable selectors (todayItems, plantedGoals, etc.)
│   │
│   ├── components/               # Presentational + small composite components
│   │   ├── ios-frame/            # IOSDevice wrapper
│   │   ├── nav/                  # BottomNav, NavTab
│   │   ├── plants/               # PlantSprite, PlantHealth badge, GrowthProgress
│   │   ├── garden/               # GardenGrid, GardenTile, DecoCatalog
│   │   ├── tasks/                # TaskRow, RoutineRow, AddTaskModal
│   │   ├── goals/                # GoalCard, GoalEditor, GoalList
│   │   ├── wheel/                # WheelOfLife (priorities slider)
│   │   ├── primitives/           # Button, Modal, Sheet, Chip, ProgressBar
│   │   └── icons/                # SVG icons as components
│   │
│   ├── features/                 # Tab-level compositions; each owns its UX
│   │   ├── today/                # TodayTab
│   │   ├── garden/               # GardenTab (the visual garden + shop)
│   │   ├── plans/                # PlansTab (list of goals + edit)
│   │   ├── history/              # HistoryTab (calendar + completion log)
│   │   ├── profile/              # ProfileTab
│   │   ├── login/                # LoginPage
│   │   └── onboarding/           # SetPrioritiesModal (Wheel of Life budgeting)
│   │
│   ├── lib/                      # Cross-cutting helpers (no domain knowledge)
│   │   ├── date.ts               # toISO, addDays, isoToday — clock-injectable
│   │   ├── classnames.ts         # cn()
│   │   └── persist.ts            # storage adapter (swap for SSR-safe)
│   │
│   └── styles/
│       └── globals.css           # Tailwind layers + CSS variables for tokens
│
├── tests/
│   └── e2e/                      # Playwright specs
│
├── docs/                         # This folder
└── public/
```

### Why split `components/` and `features/`?

`components/` are reusable building blocks with no knowledge of the store. `features/` are the tab-level screens that wire components to selectors and actions. This keeps the building blocks easy to reuse (and Storybook-able later) and makes it obvious where business orchestration lives.

### Why a top-level `src/`?

Next.js convention; keeps `app/` thin (route entries that import from `src/`).

## 5. State management contract

- **Single store.** `useGrowthStore` is the only place state lives. No Context-based duplicates.
- **Selectors over destructuring the whole store.** Components subscribe to the slice they need so unrelated updates don't re-render them.
- **Actions are thin.** They call domain functions and write the result back. Example:
  ```ts
  toggleTask: (goalId, taskId) => set((s) => ({
    ...applyTaskCompletion(s, { goalId, taskId, now: clock.now() }),
  }))
  ```
- **The clock is injected** into domain functions (`now: Date`). Tests pass a fixed date; production passes `new Date()`. Without this, "overdue" calculations are non-deterministic in tests.
- **Persistence is a side effect of the store.** Domain functions never touch storage.

## 6. Persistence and migrations

- Storage key: `growth_v1`. The version is part of the key, not a field, so a botched migration can't read malformed data into the new store.
- A migration is a pure function `migrate(prev: unknown, fromVersion: number): GrowthState`. We keep every migration; we don't edit old ones.
- The persisted blob is **validated with Zod on load**. If validation fails, we fall back to `INITIAL_STATE` and surface a one-time toast. No silent corruption.
- Domain types and the Zod schema live next to each other (`domain/types.ts` + `domain/schema.ts`) and are kept in sync via `z.infer`.

## 7. Rendering and routing

The app is essentially one screen with internal tabs (Today/Garden/History/Profile), gated by login + priorities-set. Two reasonable shapes:

- **A) Single route, tab state in the store.** Closest to the prototype, simplest. Browser back doesn't change tabs.
- **B) Routes per tab (`/today`, `/garden`, …).** Browser back works, deep links work. Slightly more wiring (one layout, four route segments).

We pick **B**. The cost is small, the UX win is real, and it lets us code-split per tab if any one gets heavy (the garden's deco catalog likely will).

The login + priorities flow runs as **a layout-level guard**: if `user.name` is empty, render `<LoginPage/>`; if `prioritiesLocked` is false, render the Set-Priorities modal over the active tab. We do not redirect — the prototype sets these as overlays and the design depends on that.

## 8. Performance notes (cheap things, do them now)

- Code-split the garden tab (`next/dynamic`) — the deco catalog and SVG plants are the biggest art bundle.
- Memoize derived data (`useMemo` for `todayItems`, plant health) keyed by the store slice.
- Avoid storing computed fields in the store (e.g. don't persist `health` — derive it from overdue tasks at read time).

## 9. Accessibility baseline

- All interactive elements are real `<button>` / `<a>` / form controls. No tappable `<div>`s.
- Color is never the sole carrier of meaning — plant health states have icons + labels (the prototype already does this; we keep it).
- Tap targets ≥ 44×44 px (iOS HIG). The bottom nav already meets this; keep it when porting.
- Reduced-motion preference respected for the resource-flying animations.

## 10. Open questions for the PO

1. Do we ever want this to sync across devices? If yes, plan a server context now.
2. Do we want Wheel-of-Life priorities to ever be re-opened after lock, or is that one-and-done?
3. Garden grid is fixed 8×6 in the prototype — is that locked, or should grid size scale with plant count?

These don't block v1 but should be answered before we cement the persistence schema.
