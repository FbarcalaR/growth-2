# Growth — Coding Guidelines

Read once. Apply always.

## Language and types

- TypeScript `strict: true`, `noUncheckedIndexedAccess: true`. No `any` in committed code; use `unknown` and narrow.
- Prefer `type` aliases for data shapes; reserve `interface` for things that may be augmented (rare here).
- All domain types live in `src/domain/types.ts` and are re-exported through a single barrel. Don't redeclare `Goal` in features.
- Validate at boundaries (storage load, future API responses) with Zod. Don't validate inside components.

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

## State (Zustand)

- One store: `useGrowthStore`. No secondary stores.
- Components subscribe with selectors:
  ```ts
  const goals = useGrowthStore((s) => s.goals);
  ```
  Not:
  ```ts
  const { goals } = useGrowthStore(); // re-renders on every change
  ```
- Actions are defined inside the store factory; they orchestrate, the math lives in `domain/`.
- Never mutate state outside an action.

## Domain layer

- Pure functions, pure inputs, pure outputs. No `Date.now()`, no `Math.random()`, no `localStorage`. Inject those.
- Each rule has a unit test. If you can't test it without React, it's in the wrong layer.
- Functions return new objects; we use immer only inside the store, not in domain.

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

- Domain functions throw `DomainError` for broken invariants — these are programmer errors and we want them loud in dev.
- The store catches at the boundary and surfaces a toast; it never lets a domain throw bubble into React's render.

## Git

- Branches: `feat/...`, `fix/...`, `chore/...`, `docs/...`.
- Commits: imperative subject ≤ 72 chars, body explains *why*, not *what*.
- One concern per PR. If a PR description has "and also", split it.
- No commits to `main` directly except the planning docs commit per the founding agreement.

## Tests

- Unit tests are the default. Reach for integration tests when behavior spans multiple components plus the store. Reach for e2e only for end-to-end user journeys (login → set priorities → plant a goal → complete a task → see growth).
- Snapshot tests are banned for components — they encode noise, not intent.
- Test names describe behavior: `growPlant advances stage when both resources meet requirements`.
