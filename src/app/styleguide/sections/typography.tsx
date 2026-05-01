import { Section } from "../_components";

const FONT_WEIGHTS = [
  { weight: "font-normal", label: "400 Regular" },
  { weight: "font-medium", label: "500 Medium" },
  { weight: "font-semibold", label: "600 Semibold" },
  { weight: "font-bold", label: "700 Bold" },
  { weight: "font-extrabold", label: "800 Extrabold" },
] as const;

const SIZES = ["text-xs", "text-sm", "text-base", "text-lg", "text-2xl"] as const;

export function TypographySection() {
  return (
    <Section title="Typography">
      <div className="bg-surface-card border-surface-muted space-y-3 rounded-md border p-5">
        <p className="text-brand-muted text-xs">Plus Jakarta Sans · self-hosted via next/font</p>
        <div className="space-y-2">
          {FONT_WEIGHTS.map(({ weight, label }) => (
            <p key={weight} className={`${weight} text-lg`}>
              {label} — The plant grows when watered.
            </p>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-3 sm:grid-cols-5">
          {SIZES.map((size) => (
            <div key={size} className="space-y-1">
              <p className={`${size} font-semibold`}>Aa</p>
              <code className="text-brand-muted text-xs">{size}</code>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
