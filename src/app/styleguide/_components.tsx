export type Swatch = { token: string; cssVar: string; note?: string };

export function ColorTile({ swatch }: { swatch: Swatch }) {
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

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-brand-muted text-xs font-bold tracking-wider uppercase">{title}</h2>
      {children}
    </section>
  );
}
