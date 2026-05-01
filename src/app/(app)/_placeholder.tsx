import type { ReactNode } from "react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  emoji: string;
  /** Optional tag listing the upcoming epic/story. */
  comingIn?: string;
  children?: ReactNode;
};

/**
 * Used by every authed tab page until its real feature lands. Standardises the
 * "coming soon" surface so we don't litter four near-identical files.
 */
export function PlaceholderPage({
  title,
  description,
  emoji,
  comingIn,
  children,
}: PlaceholderPageProps) {
  return (
    <section className="space-y-4 px-6 pt-8 pb-10">
      <header className="space-y-1">
        <p className="text-xl" aria-hidden>
          {emoji}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-brand-muted text-sm">{description}</p>
      </header>
      {comingIn && (
        <p className="bg-surface-card text-brand-muted inline-block rounded-md px-3 py-1.5 text-xs font-semibold">
          Coming in {comingIn}
        </p>
      )}
      {children}
    </section>
  );
}
