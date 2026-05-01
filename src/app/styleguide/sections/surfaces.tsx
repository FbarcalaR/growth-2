import { ColorTile, Section, type Swatch } from "../_components";

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

export function SurfacesSection() {
  return (
    <Section title="Surfaces">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SURFACES.map((s) => (
          <ColorTile key={s.token} swatch={s} />
        ))}
      </div>
    </Section>
  );
}

export function BrandSection() {
  return (
    <Section title="Brand greens">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {BRAND.map((s) => (
          <ColorTile key={s.token} swatch={s} />
        ))}
      </div>
    </Section>
  );
}
