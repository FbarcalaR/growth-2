# Growth — Architecture

> Revised after PR #1 review. This supersedes the v1 draft.

## 1. What we're building

**Growth** is a gamified life planner that runs in the browser. The user defines life priorities across seven areas (the Wheel of Life), creates goals tied to those areas, and each goal is represented by a plant in a garden. Tasks and routines feed resources to the plant; overdue work wilts it; finishing a goal earns a trophy.

The product launches **single-user from a UX standpoint** (each person sees only their own data, no collaboration features), but the **system is multi-user from day 1**: every entity is scoped by `userId`, the backend stores data centrally, and the same account can sign in from any device and see the same garden.

This document is the contract: what the codebase looks like, why, and where to push back if a future requirement breaks the assumption.

## 2. Stack

We pin versions in `package.json`, not in this document. The numbers below describe what's current at the time of writing — when bumping, prefer the latest stable.

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (latest stable)** | Asked for by product. App Router gives us file-based routing, Route Handlers for the API in the same repo, RSC where useful, and Server Actions for mutation flows. Single deploy target keeps the v1 surface small. |
| Language | **TypeScript (latest stable, `strict`)** | Domain types are non-trivial (resources, plant stages, repeat-day masks). The compiler catches the bugs we'd otherwise hit at runtime. |
| UI runtime | **React (latest stable)** | Comes with Next. |
| Styling | **Tailwind CSS + Atomic Design** | Tokens encoded once in `tailwind.config.ts` + `globals.css`; small components (chips, badges, info boxes, buttons) are styled **once** as atoms and reused everywhere. This is the explicit anti-duplication policy from the review. See §5. |
| Forms | **React Hook Form + Zod** | Same Zod schemas validate forms in the browser and request bodies on the server. |
| Client state | **Zustand** | UI/ephemeral state only (active tab, modal open, animation toggles). Not the source of truth for persisted data — that's the server. |
| Server state | **TanStack Query (React Query)** | Caches API responses, handles loading/error states, optimistic updates for task toggles. Replaces the prototype's `localStorage` reducer pattern. |
| Backend | **Next.js Route Handlers** in the same repo, layered over a service / repository / domain stack | Lightest possible surface that still gives us a real backend boundary. We do not build a separate service; if we ever outgrow the same-repo model we extract `src/server/` cleanly. |
| Database (now) | **In-memory repository** | Keeps v1 simple. Same interface as the production repository — swapping is a code change, not an architectural one. |
| Database (planned) | **PostgreSQL via Prisma** | Reasons in §6. Postgres because the model is relational (users → goals → tasks/routines, garden tiles, deco grid). Prisma because it gives us type-safe queries, migrations, and adapters for hosted Postgres providers (Neon, Supabase, RDS) without rewriting the data layer. |
| Auth (planned) | **Auth.js (NextAuth v5)** | First-class Next.js support, OAuth + email magic links + credentials, database adapter for the same Prisma instance. We design the schema and middleware to be auth-ready now (every record carries `userId`); we can flip on the actual provider in one focused PR. |
| Tests | **Vitest + React Testing Library + Playwright** | Vitest for unit/integration; Playwright for end-to-end flows. See `testing-strategy.md`. |
| Lint/format | ESLint (Next config) + Prettier + `tsc --noEmit` in CI | Standard. |

### Things we explicitly are not adding (yet)

- A separate backend service or microservices.
- A component library (MUI, shadcn). The visual language is specific enough that the atomic-design layer we build is cheaper than wrapping a generic library.
- Internationalization — single locale (en-US) until product asks otherwise.
- Real-time / websockets — not needed; sync is pull-based via TanStack Query.

When any of those assumptions breaks, revisit this section before adding the dependency.

## 3. Architectural style: light DDD on the **backend**

The domain — Goal, Task, Routine, Plant, Resource, Garden — has non-trivial rules: a plant grows when its accumulated resources cover a stage's requirements; health is derived from the count and age of overdue tasks; completing a goal awards a trophy and frees its tile. **Those rules live on the server**, in pure TypeScript, behind Route Handlers. The frontend never re-implements them.

What we **adopt** from DDD (server-side):

- A **`src/server/domain/` layer** of pure functions: business rules, no I/O, no clock side effects (the clock is injected). Easy to unit-test.
- **Ubiquitous language**: code uses the same words the user sees — `goal`, `task`, `routine`, `plant`, `resource`, `area`, `tile`, `decoration`. No `Item`/`Entity`/`Record` placeholders.
- **Invariants enforced in one place**: e.g. "you can't plant two goals on the same tile" lives in a domain function called by the service, not duplicated in handlers and the UI.
- **Repositories** as the seam between domain and persistence — see §6.

What we **don't** adopt:

- **No aggregate roots, CQRS, or event sourcing.** Single-context app, single store of record.
- **No bounded contexts.** The whole app is one context.
- **No DDD on the frontend.** The frontend renders state and dispatches mutations; rules belong to the server.

If the app gains real-time collab, multi-context, or extracted services later, this layering is the migration we're protecting.

## 4. Repository structure

```
growth-2/
├── app/                              # Next.js App Router (frontend + API routes)
│   ├── layout.tsx                    # Root layout: fonts, theme, query client provider
│   ├── page.tsx                      # Redirects to /today
│   ├── (app)/                        # Authed app shell (route group)
│   │   ├── layout.tsx                # Bottom nav, auth/onboarding guard
│   │   ├── today/page.tsx
│   │   ├── garden/page.tsx
│   │   ├── history/page.tsx
│   │   └── profile/page.tsx
│   ├── login/page.tsx                # Public
│   └── api/                          # Route Handlers (the backend's HTTP surface)
│       ├── goals/route.ts            # GET, POST
│       ├── goals/[id]/route.ts       # PATCH, DELETE
│       ├── goals/[id]/tasks/route.ts
│       ├── goals/[id]/routines/route.ts
│       ├── garden/route.ts
│       ├── shop/route.ts
│       └── me/route.ts               # current user, priorities
│
├── src/
│   ├── server/                       # Backend code. Never imported by client components.
│   │   ├── domain/                   # Pure TS rules; no I/O, no clock
│   │   │   ├── clock.ts              # Clock interface, frozenClock, ISODate
│   │   │   ├── errors.ts             # DomainError + error codes
│   │   │   ├── area.ts               # AREA_RESOURCE, AREA_DEFAULT_PLANT
│   │   │   ├── health.ts             # getOverdueCount, getHealth, getHealthState
│   │   │   ├── plant/                # Per-entity folders own their types/schemas/rules
│   │   │   │   ├── types.ts
│   │   │   │   ├── schemas.ts
│   │   │   │   ├── definitions.ts    # PLANT_DEFS, STAGE_NAMES
│   │   │   │   ├── resources.ts      # applyResourceDelta
│   │   │   │   └── growth.ts         # growPlant, meetsRequirement
│   │   │   ├── user/
│   │   │   │   ├── types.ts          # User, WheelOfLife
│   │   │   │   ├── schemas.ts
│   │   │   │   └── wheel.ts          # lockPriorities, emptyWheel, wheelTotal
│   │   │   ├── goal/
│   │   │   │   ├── types.ts          # Goal, Task, Routine, ID types
│   │   │   │   ├── schemas.ts
│   │   │   │   ├── rewards.ts        # taskCompletionReward, routineCompletionReward
│   │   │   │   ├── completion.ts     # applyTaskCompletion, applyRoutineCompletion
│   │   │   │   └── lifecycle.ts      # completeGoal, replantGoal
│   │   │   ├── garden/
│   │   │   │   ├── types.ts          # GardenState, GardenTile, DecoItem, GARDEN_COLS/ROWS
│   │   │   │   ├── schemas.ts
│   │   │   │   └── operations.ts     # plantGoalOnTile, placeDeco, etc.
│   │   │   └── __tests__/
│   │   ├── services/                 # Use-cases that orchestrate domain + repos
│   │   │   ├── goals.ts
│   │   │   ├── tasks.ts
│   │   │   ├── routines.ts
│   │   │   ├── garden.ts
│   │   │   └── shop.ts
│   │   ├── repositories/             # Persistence interfaces + implementations
│   │   │   ├── user-repo.ts          # One file per repo interface
│   │   │   ├── goal-repo.ts
│   │   │   ├── garden-repo.ts
│   │   │   ├── shop-repo.ts
│   │   │   ├── index.ts              # Repositories aggregate type
│   │   │   ├── memory/               # In-memory impls (current)
│   │   │   └── prisma/               # Postgres impls (planned, Epic A)
│   │   ├── auth/                     # Auth.js wiring (placeholder until Epic A)
│   │   ├── http/                     # Request validation, error mapping, response shapers
│   │   └── container.ts              # Composition root: picks impls, exposes services
│   │
│   ├── components/                   # Atomic Design — see §5
│   │   ├── atoms/                    # Button, Chip, Badge, Icon, ProgressBar, Input
│   │   ├── molecules/                # TaskRow, RoutineRow, AreaPicker, ResourceMeter
│   │   ├── organisms/                # GoalCard, GardenGrid, WheelOfLife, BottomNav
│   │   └── templates/                # AppShell, ModalShell, OnboardingShell
│   │
│   ├── features/                     # Tab-level compositions; wire data to UI
│   │   ├── today/
│   │   ├── garden/
│   │   ├── plans/
│   │   ├── history/
│   │   ├── profile/
│   │   ├── login/
│   │   └── onboarding/
│   │
│   ├── client/                       # Frontend infra
│   │   ├── api/                      # Generated/typed clients per route, used by hooks
│   │   ├── hooks/                    # useGoals, useToggleTask — wraps TanStack Query
│   │   ├── store/                    # Zustand — UI-only state (active tab, modals)
│   │   └── lib/                      # date, classnames (cn), formatters
│   │
│   ├── shared/                       # Code legitimately shared across client/server
│   │   ├── schemas/                  # Zod — request/response + form validation
│   │   └── types.ts                  # DTOs (the wire format)
│   │
│   └── styles/
│       └── globals.css               # Tailwind layers + CSS variables for tokens
│
├── tests/
│   └── e2e/                          # Playwright
│
├── docs/
└── public/
```

### Key rules

- `src/server/**` is **never imported from a client component**. Enforced by ESLint (`no-restricted-imports` + a `'server-only'` import in `src/server/index.ts`).
- The frontend talks to the backend **only** through `src/client/api/*` clients. No direct DB access from RSC, no calling services from components.
- `src/shared/**` is the only place both sides import from; it must be I/O-free.

## 5. Atomic design + Tailwind

The review's directive: small components styled once, reused everywhere. We adopt the four practical layers of atomic design:

- **Atoms** — `Button`, `Chip`, `Badge`, `Icon`, `Input`, `ProgressBar`, `Avatar`, `Toggle`. Each owns its Tailwind class composition for every variant. The rest of the app **must not** restyle these — variants are added inside the atom.
- **Molecules** — small functional groupings: `TaskRow`, `RoutineRow`, `AreaPicker`, `ResourceMeter`, `HealthBadge`. Made of atoms, no business logic.
- **Organisms** — domain-aware blocks: `GoalCard`, `GardenGrid`, `WheelOfLife`, `BottomNav`. May read from the store or accept structured props.
- **Templates** — page skeletons (`AppShell`, `OnboardingShell`).

Pages live in `app/`; they compose templates and organisms.

Conventions:
- Tokens (color, radius, spacing, motion) come from `tailwind.config.ts`. **No hex values inside components.**
- `cn()` for conditional class composition.
- Variants on atoms are typed (`size: 'sm'|'md'|'lg'`), not string-untyped Tailwind blobs at the call site.
- A `/styleguide` route renders every atom + molecule for review.

## 6. Backend, persistence, and the swap-to-Postgres plan

### Now: in-memory repositories

Each repository is an interface (`GoalRepo`, `UserRepo`, `GardenRepo`, etc.) with a current in-memory implementation. The composition root in `src/server/container.ts` instantiates them and hands them to services. Process restarts wipe the data — that's acceptable for v1 dev, and tests don't depend on persistence.

In-memory data is keyed by `userId` from day 1. Until Auth.js lands, requests carry a stub user header (`X-Dev-User`) in development; production builds reject requests without a real session.

### Planned: PostgreSQL via Prisma

When we promote storage:

1. Add `prisma/schema.prisma` modeling `User`, `Goal`, `Task`, `Routine`, `GardenTile`, `OwnedDeco`, `Trophy`. Foreign keys on `userId`.
2. Implement `src/server/repositories/prisma/*.ts` against the same interfaces.
3. Switch the binding in `container.ts`. **No service or domain code changes.**
4. Provision Postgres (Neon or Supabase to start; migration to managed Postgres later is trivial).

Reasons we picked Postgres:
- The data is relational (one-to-many goal→tasks, goal↔tile uniqueness, user↔goal ownership).
- Strong constraints (unique tile per user) belong at the DB level, not just app level.
- Prisma's migrations + type generation align with our TS-strict policy.

We considered SQLite (too small for multi-user hosted) and a document store (the model is too relational for that to be a win).

### Sync across devices

Yes — this is what the backend buys us. Same user, multiple browsers/devices, identical data. TanStack Query polls/refocuses to keep the UI fresh. No real-time push at v1.

### Auth: deferred but designed for

- Every record is `userId`-scoped from day 1.
- Every Route Handler runs through a single `requireUser(req)` helper. Today it returns the dev stub; tomorrow it returns the Auth.js session subject. Handlers don't change.
- We intentionally don't implement OAuth in v1 — but the schema and middleware are ready for it.

## 7. Routing and navigation

- Public routes: `/login`.
- Authed routes (route group `(app)`): `/today`, `/garden`, `/history`, `/profile`. Each is a real page so browser back works and tabs are deep-linkable.
- The `(app)` layout enforces two guards: signed in (today: dev stub; later: real session) and `prioritiesLocked === true`. If priorities aren't locked, the `SetPrioritiesModal` overlays the active tab — it cannot be dismissed except by submitting.

## 8. Performance notes

- Code-split the garden tab — the deco catalog and SVG sprites are the largest art bundle.
- TanStack Query caches by user — switching tabs doesn't refetch.
- Memoize derived data (today's items, plant health) in selectors, not in components.
- Health is **never** persisted; it's derived from overdue tasks at read time on the server and returned alongside goals.

## 9. Accessibility baseline

- All interactive elements are real `<button>`/`<a>`/form controls.
- Color is never the sole carrier of meaning — plant health states have icons + labels.
- Tap targets ≥ 44×44 px.
- `prefers-reduced-motion` honored.
- Bottom nav has visible focus states (now important on the web — keyboard users exist, unlike on the mobile prototype).

## 10. Resolved questions (from PR #1 review)

| Question | Decision |
|---|---|
| iOS frame in production? | **No.** Render directly in the browser. The frame was prototype-only. |
| Sync across devices? | **Yes, eventually** — and the backend is the mechanism, designed in from day 1. |
| Re-open Wheel of Life after lock? | **No, locked one-time.** Out of scope for v1. |
| Garden grid resize? | **No, locked 8×6.** Out of scope for v1. |
| Multi-user? | **System: yes, from day 1.** UX: single-user (no collaboration) at v1. |
| Backend? | **Yes, in this repo, from day 1.** In-memory now → Prisma + Postgres next. |
| Domain placement? | **Backend.** The frontend never re-implements rules. |

## 11. Open questions to revisit

1. Do we want Server Actions or Route Handlers as the default mutation surface? (Route Handlers chosen for v1 because TanStack Query and OpenAPI tooling speak HTTP; revisit if we adopt RSC mutations heavily.)
2. Hosted Postgres provider for production: Neon vs Supabase vs RDS — answer when we provision.
3. Auth provider: email magic link vs OAuth-first — answer when Epic A starts.
