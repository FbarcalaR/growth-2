# Growth — Design System

Tokens lifted from the [prototype](./prototype-design/README.md). Encoded in Tailwind v4's `@theme` block inside `src/app/globals.css` (Tailwind v4 is CSS-first; there is no `tailwind.config.ts`). Do not hardcode hexes in components.

## Typography

- Family: **Plus Jakarta Sans** (400, 500, 600, 700, 800), self-hosted via `next/font`.
- Sizes (mobile): 10 (nav), 12 (caption), 14 (body), 16 (lead), 20–28 (titles).
- Tracking: tight on display titles (`-0.01em`), normal elsewhere.

## Surfaces

| Token | Value | Use |
|---|---|---|
| `surface-app` | `#F4F7F0` | Main background |
| `surface-card` | `#FFFFFF` | Cards, sheets |
| `surface-muted` | `#E8EDE5` | Dividers, subtle fills |
| `surface-frame` | `#2C3E2D` | Page (outside the iOS frame) |
| `welcome-from` | `#F0F7E8` | Welcome gradient stop 1 (top-left) |
| `welcome-via` | `#E8F5E9` | Welcome gradient stop 2 (60%) |
| `welcome-to` | `#F1F8E9` | Welcome gradient stop 3 (bottom-right) |

The welcome surface is composed via `linear-gradient(160deg, var(--color-welcome-from) 0%, var(--color-welcome-via) 60%, var(--color-welcome-to) 100%)` — used today on `/login`, expected to reuse for the Set-Priorities modal in Story 1.2.

## Ink (text)

| Token | Value | Use |
|---|---|---|
| `ink-strong` | `#1C2B20` | Hero titles on the welcome surface |
| `ink-soft` | `#6B7F70` | Tagline / secondary copy on the welcome surface |
| `ink-faint` | `#A8BCA8` | Privacy notes / fine print |
| `input-border` | `#C8E6C9` | Default input border (lighter sage than `brand-track`); also reused for empty-state dashed outlines on `/garden`. |

## Warm accent (gold/orange)

A three-token group for the warm-accent palette used on the coin pill, the streak pill, and the trophy badge that appears on completed goals. When a fourth surface adopts the look, reach for `<AccentPill>` (atom) instead of re-deriving the classes.

| Token | Value | Use |
|---|---|---|
| `accent-warm` | `#F0A500` | Foreground (text, icons) |
| `accent-warm-bg` | `#FFF8E1` | Pill / badge background |
| `accent-warm-border` | `#FFE0B2` | Pill / badge border |

## Brand greens

| Token | Value | Use |
|---|---|---|
| `brand-700` | `#3A6647` | Primary text/icon, active states |
| `brand-500` | `#66BB6A` | Accents, success |
| `brand-100` | `#F0F7F0` | Tinted fills (active nav) |
| `brand-muted` | `#9EB09E` | Inactive icon/text |
| `brand-track` | `#C8D6C8` | Home indicator, subtle outlines |

## Life-area colors

| Area | Color | Icon |
|---|---|---|
| health | `#66BB6A` | 💪 |
| career | `#42A5F5` | 💼 |
| finances | `#FFA726` | 💰 |
| relationships | `#EC407A` | ❤️ |
| personal | `#AB47BC` | ✨ |
| fun | `#26C6DA` | 🎉 |
| spirituality | `#8D6E63` | 🌙 |

## Resource colors

| Resource | Color | BG | Icon |
|---|---|---|---|
| water | `#29B6F6` | `#E3F2FD` | 💧 |
| sunlight | `#FDD835` | `#FFFDE7` | ☀️ |
| gold | `#FFA726` | `#FFF3E0` | 🪙 |
| love | `#EC407A` | `#FCE4EC` | 🌸 |
| nutrients | `#66BB6A` | `#E8F5E9` | 🌿 |
| magic | `#AB47BC` | `#F3E5F5` | ✨ |
| moonlight | `#7986CB` | `#E8EAF6` | 🌙 |

## Plant stage colors

`['#9E9E9E', '#8BC34A', '#4CAF50', '#2E7D32', '#FDD835']` for stages 0..4 respectively.

## Health states

| State | Fg | Bg | Icon | Copy |
|---|---|---|---|---|
| healthy | `#3A6647` | `#E8F0E8` | 🌿 | "Thriving" |
| wilting | `#B58900` | `#FFF8E1` | 🥀 | "A task is overdue — catch up to perk it back up" |
| ill | `#D97706` | `#FFEDD5` | 😷 | "Multiple tasks overdue — your plant is struggling" |
| critical | `#C9484E` | `#FBE3E5` | ⚠️ | "On the brink — finish a task today to save it" |
| dead | `#5A5A5A` | `#EAEAEA` | 💀 | "Your plant withered. Replant or drop the goal." |

## Spacing & radius

- Spacing scale: 2, 4, 6, 8, 12, 16, 20, 24, 32 px (Tailwind defaults are fine).
- Radii: `8` small (chips), `12` medium (cards), `16` large (modals), `24` xl (sheets), `999` pill.

## Motion

- Tap feedback: `transform: scale(0.92)` on touchstart, restore on touchend.
- Resource fly-to-plant animation: 600ms `cubic-bezier(0.22, 1, 0.36, 1)`. Suppressed under `prefers-reduced-motion`.
- Plant stage-transition (`plant-grow`): 700ms `cubic-bezier(0.34, 1.56, 0.64, 1)`, transform-origin `center bottom`. Plays on the goal-card sprite when `stage` advances. Suppressed under `prefers-reduced-motion`.
- Tab transitions: 200ms cross-fade or none — never slide.

Components reading `prefers-reduced-motion` should go through `useReducedMotion()` (`src/client/hooks/use-reduced-motion.ts`) — a `useSyncExternalStore` wrapper that's SSR-safe and reactive to OS-level changes. Backstop with the same media query at the CSS level (`@media (prefers-reduced-motion: reduce) { .anim { animation: none } }`) so anything that bypasses the hook still degrades gracefully.

## Layout container

The app renders directly in the browser — there is **no simulated device frame** in production. The frame in the prototype was for demo purposes only.

For the responsive shell:
- On mobile widths (< 480px), the app spans full width.
- On wider viewports, content is centered in a max-width column (~480px) on a soft `surface-frame` page background, so the mobile-first layout stays legible on desktop without faking a phone.
