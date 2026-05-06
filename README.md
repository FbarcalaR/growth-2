# Growth

A gamified life planner. Set priorities across seven life areas, plant goals as
seeds, and water them with daily action — tasks and routines feed resources to
the plant, growing it through five stages. Overdue work wilts it; finishing the
goal earns a trophy in your garden.

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · React 19 ·
TanStack Query. Backend in the same repo via Route Handlers; in-memory
repositories now, Postgres + Prisma planned (Epic A). See [`docs/`](./docs/)
for the full architecture.

## Tabs

| Tab | Route | What it does |
|---|---|---|
| Today | `/today` | Daily to-do list — toggle tasks/routines, plant grows on completion |
| Garden | `/garden` | 8×6 isometric plot — plant goals on tilled tiles, place decorations on grass, view trophies + shop |
| History | `/history` | Month calendar — per-day completion bubbles, streak summary, day-detail panel |
| Profile | `/profile` | Display name + edit, total coins / streak / goals, reset all data |

## Run

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm format         # prettier --write
pnpm test:unit      # vitest run
pnpm test:e2e       # playwright (requires `pnpm exec playwright install`)
pnpm build          # production build
```

Visit `/styleguide` to see every design token. Visual reference for every
user-visible PR is the prototype bundle under
[`docs/prototype-design/`](./docs/prototype-design/README.md) (the
`screenshots/` subfolder shows each tab as designed).

## Persistence

The repo selection lives behind the `GROWTH_REPO` env var:

- **`memory`** (default) — in-memory store. Wipes on every server restart.
  Suitable for local dev, the test suite, and the dev sandbox.
- **`prisma`** — Postgres via Prisma 6 (Epic A). Reads `DATABASE_URL` from
  the same env. Use in Vercel preview / production. Vercel's Neon
  integration sets `DATABASE_URL` automatically.

```bash
# Local Prisma flow (assumes a Postgres on DATABASE_URL):
pnpm db:generate    # regenerate the client (also runs on install)
pnpm db:migrate     # `prisma migrate dev` — create + apply a migration
pnpm db:deploy      # `prisma migrate deploy` — apply pending migrations in CI/prod
pnpm db:seed        # seed a demo "Ada" user with two goals

# Run the conformance suite against Postgres:
RUN_PRISMA_TESTS=1 DATABASE_URL=... pnpm test:unit
```

For **Vercel deploys** with the Neon integration: set the project's
**Build Command** to `pnpm vercel-build`. That runs `prisma migrate deploy`
against the Vercel-injected `DATABASE_URL` before `next build`, so every
deploy applies any pending migrations atomically.

## Auth

Epic B switched the dev-stub "type a name" flow to **Google OAuth via
Auth.js** (NextAuth v5). In production the `/login` page shows a single
"Continue with Google" button; the OAuth round-trip lands the user on
`/today`. In test / non-production environments the dev-stub cookie path
still works so the unit suites don't have to mock OAuth.

Required env vars (Production + Preview):

```bash
AUTH_SECRET="<openssl rand -base64 32>"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Google Cloud setup:

1. Create a project at `console.cloud.google.com`.
2. **APIs & Services → OAuth consent screen** — External, fill in the
   minimum required fields.
3. **APIs & Services → Credentials → Create OAuth client ID** — "Web
   application".
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-vercel-domain>/api/auth/callback/google`
5. Copy the Client ID + Secret into the env vars above.

Sessions are JWT (stateless — no DB hit per request). The Prisma
`Account` / `Session` / `VerificationToken` tables ship with the
`1_auth` migration so a future flip to DB sessions, magic-link, or
Credentials provider doesn't need a schema change.

## Docs

| Doc | What it covers |
|---|---|
| [`docs/architecture.md`](./docs/architecture.md) | Stack rationale, layering, folder structure, persistence plan |
| [`docs/domain-model.md`](./docs/domain-model.md) | Entities, invariants, business rules |
| [`docs/design-system.md`](./docs/design-system.md) | Design tokens (colors, type, motion) |
| [`docs/coding-guidelines.md`](./docs/coding-guidelines.md) | TS/React/Next conventions |
| [`docs/testing-strategy.md`](./docs/testing-strategy.md) | Test pyramid + coverage philosophy |
| [`docs/product-backlog.md`](./docs/product-backlog.md) | Epics → stories → tasks, ordered for delivery |
| [`docs/prototype-design/`](./docs/prototype-design/README.md) | The original design bundle — authoritative visual reference for every user-visible PR |
