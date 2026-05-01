import { Section } from "../_components";

const RESOURCES = [
  { fg: "res-water", bg: "res-water-bg", icon: "💧", label: "Water" },
  { fg: "res-sunlight", bg: "res-sunlight-bg", icon: "☀️", label: "Sunlight" },
  { fg: "res-gold", bg: "res-gold-bg", icon: "🪙", label: "Gold" },
  { fg: "res-love", bg: "res-love-bg", icon: "🌸", label: "Love" },
  { fg: "res-nutrients", bg: "res-nutrients-bg", icon: "🌿", label: "Nutrients" },
  { fg: "res-magic", bg: "res-magic-bg", icon: "✨", label: "Magic" },
  { fg: "res-moonlight", bg: "res-moonlight-bg", icon: "🌙", label: "Moonlight" },
] as const;

export function ResourcesSection() {
  return (
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
  );
}
