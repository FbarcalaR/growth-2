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
