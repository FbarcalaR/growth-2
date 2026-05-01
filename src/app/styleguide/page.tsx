import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Growth · Style Guide",
};

type Swatch = { token: string; cssVar: string; note?: string };

const SURFACES: Swatch[] = [
  { token: "surface-app", cssVar: "--color-surface-app", note: "Main background" },
  { token: "surface-card", cssVar: "--color-surface-card", note: "Cards, sheets" },
  { token: "surface-muted", cssVar: "--color-surface-muted", note: "Dividers" },
  { token: "surface-frame", cssVar: "--color-surface-frame", note: "Page (outside content)" },
];

const BRAND: Swatch[] = [
  { token: "brand-700", cssVar: "--color-brand-700", note: "Primary text/icon, active" },
  { token: "brand-500", cssVar: "--color-brand-500", note: "Accent, success" },
  { token: "brand-100", cssVar: "--color-brand-100", note: "Tinted fills" },
  { token: "brand-muted", cssVar: "--color-brand-muted", note: "Inactive icon/text" },
  { token: "brand-track", cssVar: "--color-brand-track", note: "Subtle outlines" },
];

const AREAS = [
  { token: "area-health", icon: "💪", label: "Health" },
  { token: "area-career", icon: "💼", label: "Career" },
  { token: "area-finances", icon: "💰", label: "Finances" },
  { token: "area-relationships", icon: "❤️", label: "Relations" },
  { token: "area-personal", icon: "✨", label: "Growth" },
  { token: "area-fun", icon: "🎉", label: "Fun" },
  { token: "area-spirituality", icon: "🌙", label: "Purpose" },
] as const;

const RESOURCES = [
  { fg: "res-water", bg: "res-water-bg", icon: "💧", label: "Water" },
  { fg: "res-sunlight", bg: "res-sunlight-bg", icon: "☀️", label: "Sunlight" },
  { fg: "res-gold", bg: "res-gold-bg", icon: "🪙", label: "Gold" },
  { fg: "res-love", bg: "res-love-bg", icon: "🌸", label: "Love" },
  { fg: "res-nutrients", bg: "res-nutrients-bg", icon: "🌿", label: "Nutrients" },
  { fg: "res-magic", bg: "res-magic-bg", icon: "✨", label: "Magic" },
  { fg: "res-moonlight", bg: "res-moonlight-bg", icon: "🌙", label: "Moonlight" },
] as const;

const STAGES = [
  { token: "stage-0", label: "Seed" },
  { token: "stage-1", label: "Sprout" },
  { token: "stage-2", label: "Seedling" },
  { token: "stage-3", label: "Mature" },
  { token: "stage-4", label: "Blooming" },
] as const;

const HEALTH = [
  { fg: "health-healthy", bg: "health-healthy-bg", icon: "🌿", label: "Healthy", copy: "Thriving" },
  {
    fg: "health-wilting",
    bg: "health-wilting-bg",
    icon: "🥀",
    label: "Wilting",
    copy: "A task is overdue",
  },
  {
    fg: "health-ill",
    bg: "health-ill-bg",
    icon: "😷",
    label: "Ill",
    copy: "Multiple tasks overdue",
  },
  {
    fg: "health-critical",
    bg: "health-critical-bg",
    icon: "⚠️",
    label: "Critical",
    copy: "On the brink",
  },
  {
    fg: "health-dead",
    bg: "health-dead-bg",
    icon: "💀",
    label: "Dead",
    copy: "Replant or drop",
  },
] as const;

const RADII = [
  { token: "rounded-sm", label: "8px (chips)" },
  { token: "rounded-md", label: "12px (cards)" },
  { token: "rounded-lg", label: "16px (modals)" },
  { token: "rounded-xl", label: "24px (sheets)" },
  { token: "rounded-pill", label: "9999px (pill)" },
] as const;

const FONT_WEIGHTS = [
  { weight: "font-normal", label: "400 Regular" },
  { weight: "font-medium", label: "500 Medium" },
  { weight: "font-semibold", label: "600 Semibold" },
  { weight: "font-bold", label: "700 Bold" },
  { weight: "font-extrabold", label: "800 Extrabold" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-brand-muted text-xs font-bold tracking-wider uppercase">{title}</h2>
      {children}
    </section>
  );
}

function ColorTile({ swatch }: { swatch: Swatch }) {
  return (
    <div className="bg-surface-card border-surface-muted overflow-hidden rounded-md border">
      <div className="h-16 w-full" style={{ background: `var(${swatch.cssVar})` }} />
      <div className="space-y-1 p-3">
        <code className="text-brand-700 text-xs font-semibold">{swatch.token}</code>
        {swatch.note && <p className="text-brand-muted text-xs">{swatch.note}</p>}
      </div>
    </div>
  );
}

export default function StyleGuide() {
  return (
    <main className="bg-surface-app text-brand-700 min-h-screen py-10">
      <div className="mx-auto max-w-5xl space-y-12 px-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Growth · Style Guide</h1>
          <p className="text-brand-muted text-sm">
            The single source of truth for design tokens. Every color, font weight, radius, and
            domain swatch lives here. If you need a hex value in a component, you&rsquo;re probably
            doing it wrong — add a token first.
          </p>
        </header>

        <Section title="Typography">
          <div className="bg-surface-card border-surface-muted space-y-3 rounded-md border p-5">
            <p className="text-brand-muted text-xs">
              Plus Jakarta Sans · self-hosted via next/font
            </p>
            <div className="space-y-2">
              {FONT_WEIGHTS.map(({ weight, label }) => (
                <p key={weight} className={`${weight} text-lg`}>
                  {label} — The plant grows when watered.
                </p>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 sm:grid-cols-5">
              {["text-xs", "text-sm", "text-base", "text-lg", "text-2xl"].map((size) => (
                <div key={size} className="space-y-1">
                  <p className={`${size} font-semibold`}>Aa</p>
                  <code className="text-brand-muted text-xs">{size}</code>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Surfaces">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SURFACES.map((s) => (
              <ColorTile key={s.token} swatch={s} />
            ))}
          </div>
        </Section>

        <Section title="Brand greens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {BRAND.map((s) => (
              <ColorTile key={s.token} swatch={s} />
            ))}
          </div>
        </Section>

        <Section title="Life areas">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {AREAS.map(({ token, icon, label }) => (
              <div
                key={token}
                className="bg-surface-card border-surface-muted flex flex-col items-center gap-2 rounded-md border p-4"
              >
                <div
                  className="rounded-pill flex h-12 w-12 items-center justify-center text-xl"
                  style={{ background: `var(--color-${token})`, color: "#fff" }}
                >
                  {icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">{label}</p>
                  <code className="text-brand-muted text-xs">{token}</code>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Resources">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {RESOURCES.map(({ fg, bg, icon, label }) => (
              <div
                key={fg}
                className="flex flex-col items-center gap-1 rounded-md p-4"
                style={{ background: `var(--color-${bg})`, color: `var(--color-${fg})` }}
              >
                <span className="text-2xl">{icon}</span>
                <p className="text-sm font-semibold">{label}</p>
                <code className="text-xs opacity-70">{fg}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Plant stages">
          <div className="grid grid-cols-5 gap-3">
            {STAGES.map(({ token, label }) => (
              <div
                key={token}
                className="bg-surface-card border-surface-muted flex flex-col items-center gap-2 rounded-md border p-4"
              >
                <div
                  className="rounded-pill h-12 w-12"
                  style={{ background: `var(--color-${token})` }}
                />
                <p className="text-sm font-semibold">{label}</p>
                <code className="text-brand-muted text-xs">{token}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Health states">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {HEALTH.map(({ fg, bg, icon, label, copy }) => (
              <div
                key={fg}
                className="space-y-2 rounded-md p-4"
                style={{ background: `var(--color-${bg})`, color: `var(--color-${fg})` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-bold">{label}</span>
                </div>
                <p className="text-xs opacity-80">{copy}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radii">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {RADII.map(({ token, label }) => (
              <div
                key={token}
                className="bg-surface-card border-surface-muted flex flex-col items-center gap-2 border p-4"
                style={{ borderRadius: "12px" }}
              >
                <div className={`bg-brand-700 h-14 w-14 ${token}`} />
                <code className="text-brand-muted text-xs">{token}</code>
                <p className="text-brand-muted text-xs">{label}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Spacing scale">
          <div className="bg-surface-card border-surface-muted flex flex-wrap items-end gap-2 rounded-md border p-4">
            {[2, 4, 6, 8, 12, 16, 20, 24, 32].map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <div className="bg-brand-700" style={{ width: n, height: n }} />
                <code className="text-brand-muted text-xs">{n}px</code>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
