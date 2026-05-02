import { Sprout } from "lucide-react";

export function EmptyState() {
  return (
    <div className="bg-surface-card border-surface-muted mt-2 flex flex-col items-center gap-2 rounded-lg border-[1.5px] px-6 py-12 text-center">
      <Sprout size={36} className="text-brand-muted" aria-hidden />
      <p className="text-ink-strong text-sm font-bold">Nothing for today</p>
      <p className="text-brand-muted max-w-xs text-xs">
        When you have tasks or routines due today, they&rsquo;ll show up here.
      </p>
    </div>
  );
}
