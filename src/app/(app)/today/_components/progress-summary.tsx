type ProgressSummaryProps = {
  totalDone: number;
  totalAll: number;
};

export function ProgressSummary({ totalDone, totalAll }: ProgressSummaryProps) {
  const pct = totalAll === 0 ? 0 : Math.round((totalDone / totalAll) * 100);
  return (
    <div className="bg-surface-card border-surface-muted rounded-lg border-[1.5px] px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-ink-strong text-[13px] font-semibold">Today&rsquo;s Plan</span>
        <span className="text-brand-muted text-xs tabular-nums">
          {totalDone}/{totalAll} complete
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="bg-res-nutrients-bg rounded-pill h-[7px] overflow-hidden"
      >
        <div
          className="rounded-pill h-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--color-brand-700), var(--color-brand-500))",
          }}
        />
      </div>
    </div>
  );
}
