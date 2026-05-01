import { Section } from "../_components";

const STAGES = [
  { token: "stage-0", label: "Seed" },
  { token: "stage-1", label: "Sprout" },
  { token: "stage-2", label: "Seedling" },
  { token: "stage-3", label: "Mature" },
  { token: "stage-4", label: "Blooming" },
] as const;

export function StagesSection() {
  return (
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
  );
}
