import { Section } from "../_components";

const AREAS = [
  { token: "area-health", icon: "💪", label: "Health" },
  { token: "area-career", icon: "💼", label: "Career" },
  { token: "area-finances", icon: "💰", label: "Finances" },
  { token: "area-relationships", icon: "❤️", label: "Relations" },
  { token: "area-personal", icon: "✨", label: "Growth" },
  { token: "area-fun", icon: "🎉", label: "Fun" },
  { token: "area-spirituality", icon: "🌙", label: "Purpose" },
] as const;

export function AreasSection() {
  return (
    <Section title="Life areas">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {AREAS.map(({ token, icon, label }) => (
          <div
            key={token}
            className="bg-surface-card border-surface-muted flex flex-col items-center gap-2 rounded-md border p-4"
          >
            <div
              className="rounded-pill flex h-12 w-12 items-center justify-center text-xl text-white"
              style={{ background: `var(--color-${token})` }}
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
  );
}
