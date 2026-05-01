import { Section } from "../_components";

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
  { fg: "health-dead", bg: "health-dead-bg", icon: "💀", label: "Dead", copy: "Replant or drop" },
] as const;

export function HealthSection() {
  return (
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
  );
}
