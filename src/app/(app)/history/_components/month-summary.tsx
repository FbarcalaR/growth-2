import type { HistorySummaryDto } from "@/shared/schemas/history";

type MonthSummaryProps = {
  summary: HistorySummaryDto;
};

/**
 * Three small summary cards that sit above the calendar:
 *   • Month % (overall completion across past days in the queried month)
 *   • Perfect days ✓ (past days where every scheduled item was done)
 *   • Missed days ✕ (past days where nothing scheduled was done)
 *
 * Mirrors the prototype's `MonthSummary` strip in `history-tab.jsx`.
 */
export function MonthSummary({ summary }: MonthSummaryProps) {
  const monthPct = Math.round(summary.monthPct * 100);

  return (
    <div className="grid grid-cols-3 gap-2">
      <SummaryCard
        label="Month"
        value={`${monthPct}%`}
        sub={`${summary.completedThisMonth}/${summary.scheduledThisMonth}`}
        tone="brand"
      />
      <SummaryCard label="Perfect" value={summary.perfectDays} sub="all done" tone="success" />
      <SummaryCard label="Missed" value={summary.missedDays} sub="0% done" tone="critical" />
    </div>
  );
}

type Tone = "brand" | "success" | "critical";

const TONE_VALUE: Record<Tone, string> = {
  brand: "text-brand-700",
  success: "text-success-strong",
  critical: "text-health-critical",
};

const TONE_ICON: Record<Tone, string | null> = {
  brand: null,
  success: "✓",
  critical: "✕",
};

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number | string;
  sub: string;
  tone: Tone;
}) {
  const icon = TONE_ICON[tone];
  return (
    <div className="bg-surface-card border-surface-muted min-w-0 rounded-[14px] border-[1.5px] px-2 py-2.5 text-center">
      <p className={`text-[18px] leading-tight font-extrabold ${TONE_VALUE[tone]}`}>
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </p>
      <p className="text-brand-muted mt-1 text-[10px] font-bold tracking-wide uppercase">{label}</p>
      <p className="text-brand-muted mt-px text-[9px]">{sub}</p>
    </div>
  );
}
