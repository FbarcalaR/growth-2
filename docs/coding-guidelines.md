# Growth — Coding Guidelines

Read once. Apply always.

## Language and types

- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`. No `any` in committed code; use `unknown` and narrow.
- Prefer `type` aliases for data shapes; reserve `interface` for things that may be augmented (rare here).
- Domain types live in `src/server/domain/types.ts` (server-side). Wire DTOs and Zod schemas live in `src/shared/schemas/`. Components consume the inferred DTO types, not the server domain types.
- Validate at boundaries — request bodies on the server, API responses on the client — with Zod. Don't validate inside components or services.
- `src/server/**` is server-only. Never import it from `app/`, `src/components/`, `src/features/`, or `src/client/`. ESLint enforces this.

## Files and naming

- One component per file. Filename in `kebab-case`, default export named the same in `PascalCase`. (`goal-card.tsx` → `export function GoalCard`).
- Hooks: `use-*.ts`, named `useFoo`.
- Tests sit in `__tests__/` next to the code they test, named `*.spec.ts(x)`.
- Imports ordered: node/builtin → external → `@/` aliases → relative → styles. Enforce with ESLint `import/order`.

## Split files by entity / resource

When a module starts holding code for more than one domain entity (e.g. types, schemas, mappers, services, routes), **split it into one file per entity** — usually inside an entity-named folder.

- Domain types: `src/server/domain/<entity>/types.ts` (one folder per entity).
- Schemas: `src/server/domain/<entity>/schemas.ts` (server-side validation) and `src/shared/schemas/<entity>.ts` (wire DTOs). One file per entity.
- Repository interfaces: `src/server/repositories/<entity>-repo.ts` — one file per repo.
- DTO mappers: `src/server/services/dtos/<entity>.ts` — one file per entity.
- Services: `src/server/services/<entity>-service.ts` — one file per service.
- Route handlers: Next.js naturally enforces this via the `app/api/` filesystem.

When you find yourself writing `User`, `Goal`, and `Garden` code in the same file, that's the smell. Even if each section is short today, splitting now keeps grep-by-entity easy and makes future ownership boundaries (per-team, per-package) painless.

Cross-cutting helpers (`clock`, `errors`, generic utilities) stay flat at the root of their layer — they don't belong to any one entity. Use judgement: a single small constant set or one function doesn't need its own folder.

## React

- Functional components only. No class components.
- Server components by default in `app/`; mark `'use client'` only when you need state, refs, or effects.
- Lift state into the store, not into a parent component. Components either read from the store via a selector or accept props from a feature container — don't mix.
- No `useEffect` for data derivation; use `useMemo` or a selector.
- Keys must be stable IDs, never array indices.
- Event handlers prefixed `handle*` for local, `on*` for props.

## Styling

- Tailwind utility classes for layout and most styling. Use `cn()` for conditional class composition.
- Tokens (colors, radii, motion) referenced through Tailwind theme keys — never raw hex codes inside components.
- Avoid inline `style={}` except for dynamic values that can't be expressed as utilities (e.g. an animated transform).
- One global stylesheet (`globals.css`); per-component CSS files are a smell.

## State

We split state into two:

- **Server state** (goals, tasks, garden, coins) — owned by TanStack Query. Use the typed hooks in `src/client/hooks/` (`useGoals`, `useToggleTask`, …). No raw `fetch` in components.
- **Client/UI state** (active tab, open modals, transient animation flags) — owned by Zustand in `src/client/store/`.

Conventions:
- Subscribe with selectors so components re-render only on the slice they read. Don't destructure the whole store.
- Mutations go through the typed mutation hooks so optimistic updates and rollback stay consistent.

## Domain layer (server-side)

- Pure functions, pure inputs, pure outputs. No `Date.now()`, no `Math.random()`, no I/O. Inject the clock.
- Each rule has at least one unit test.
- Domain functions return new values; mutation happens in services or repositories.
- Domain functions throw `DomainError` on invariant violations — services translate to HTTP errors at the boundary.

## Accessibility

- Interactive elements are real `<button>`/`<a>`/inputs.
- Every icon-only button has `aria-label`.
- Color is decorative; meaning has a label or icon companion.
- Honor `prefers-reduced-motion`.
- Tap targets ≥ 44×44 px.

## Comments

- Default to none. The code names things well; let it speak.
- Write a comment only when the *why* is non-obvious (a workaround, a domain quirk like "long-overdue counts double").
- No section banners (`// ─── Header ───`).
- No TODOs without an owner and a ticket reference.

## Errors

- Domain functions throw `DomainError` for broken invariants.
- Services let `DomainError` bubble; the HTTP error mapper at the Route Handler boundary translates them to 4xx with a stable error code.
- The frontend toast layer surfaces non-2xx responses; it never re-implements rules to "predict" errors.

## Git

- Branches: `feat/...`, `fix/...`, `chore/...`, `docs/...`.
- Commits: imperative subject ≤ 72 chars, body explains *why*, not *what*.
- One concern per PR. If a PR description has "and also", split it.
- No commits to `main` directly except the planning docs commit per the founding agreement.

## Tests

- Unit tests are the default. Reach for integration tests when behavior spans multiple components plus the store. Reach for e2e only for end-to-end user journeys (login → set priorities → plant a goal → complete a task → see growth).
- Snapshot tests are banned for components — they encode noise, not intent.
- Test names describe behavior: `growPlant advances stage when both resources meet requirements`.

## Docs are part of the PR

Code and docs ship together. Every PR that implements a backlog story or makes an architectural decision must update the relevant docs **in the same PR**:

- `docs/product-backlog.md` — tick `[x]` on the implemented sub-tasks and tag the story with the merging PR (`### Story X — Title ✅ (PR #N)`).
- `docs/domain-model.md` — when entities, invariants, or rules change.
- `docs/architecture.md` — when you make a decision that contradicts or extends what's already written (e.g. "Tailwind v4 is CSS-first; no `tailwind.config.ts`" or "we picked `lucide-react` as the icon library").
- `docs/design-system.md` — when tokens are added, removed, or renamed.
- `docs/coding-guidelines.md` — when a new convention emerges (lint rule, file-layout rule, etc.).
- `docs/testing-strategy.md` — when the testing approach evolves.

Reviewers should be able to read the doc diff and the code diff side by side. "I'll do the docs in a follow-up" is not allowed — it always slips. If the doc change feels too big for the PR, the PR is too big.
