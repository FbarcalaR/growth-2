import { Coins, Flame } from "lucide-react";

type TodayHeaderProps = {
  userName: string;
  shopCoins: number;
  streak: number;
};

export function TodayHeader({ userName, shopCoins, streak }: TodayHeaderProps) {
  const greeting = greetingForNow(new Date());
  return (
    <header className="flex items-start justify-between">
      <div>
        <p className="text-brand-muted text-xs font-medium">{greeting},</p>
        <h1 className="text-ink-strong text-[22px] leading-tight font-extrabold">
          {userName} <span aria-hidden>🌿</span>
        </h1>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Pill tone="coins" icon={<Coins size={13} aria-hidden />} value={shopCoins} suffix={null} />
        <Pill tone="streak" icon={<Flame size={12} aria-hidden />} value={streak} suffix="d" />
      </div>
    </header>
  );
}

function Pill({
  tone,
  icon,
  value,
  suffix,
}: {
  tone: "coins" | "streak";
  icon: React.ReactNode;
  value: number;
  suffix: string | null;
}) {
  // Coins + streak share an accent palette in the prototype (warm gold/orange);
  // expressed inline because it's specific to these two pills and not part of
  // the broader token system. If a third surface adopts the same look we'll
  // promote it to a `--color-accent-*` group.
  const className =
    tone === "coins"
      ? "bg-[#FFF8EC] border-[#FFE0B2] text-[#F0A500]"
      : "bg-[#FFF3E0] border-[#FFE0B2] text-[#F0A500]";
  return (
    <span
      className={`rounded-pill inline-flex items-center gap-1 border px-2.5 py-1 text-[13px] font-bold tabular-nums ${className}`}
    >
      {icon}
      <span>
        {value}
        {suffix ?? ""}
      </span>
    </span>
  );
}

function greetingForNow(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
