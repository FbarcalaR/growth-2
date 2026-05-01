import { Section } from "../_components";

const RADII = [
  { token: "rounded-sm", label: "8px (chips)" },
  { token: "rounded-md", label: "12px (cards)" },
  { token: "rounded-lg", label: "16px (modals)" },
  { token: "rounded-xl", label: "24px (sheets)" },
  { token: "rounded-pill", label: "9999px (pill)" },
] as const;

const SPACING = [2, 4, 6, 8, 12, 16, 20, 24, 32] as const;

export function RadiiSection() {
  return (
    <Section title="Radii">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {RADII.map(({ token, label }) => (
          <div
            key={token}
            className="bg-surface-card border-surface-muted flex flex-col items-center gap-2 rounded-md border p-4"
          >
            <div className={`bg-brand-700 h-14 w-14 ${token}`} />
            <code className="text-brand-muted text-xs">{token}</code>
            <p className="text-brand-muted text-xs">{label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function SpacingSection() {
  return (
    <Section title="Spacing scale">
      <div className="bg-surface-card border-surface-muted flex flex-wrap items-end gap-2 rounded-md border p-4">
        {SPACING.map((n) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <div className="bg-brand-700" style={{ width: n, height: n }} />
            <code className="text-brand-muted text-xs">{n}px</code>
          </div>
        ))}
      </div>
    </Section>
  );
}
