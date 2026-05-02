import { Coins, Flame } from "lucide-react";

import { AccentPill } from "@/components/atoms";

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
        <AccentPill icon={<Coins size={13} aria-hidden />}>{shopCoins}</AccentPill>
        <AccentPill icon={<Flame size={12} aria-hidden />}>{streak}d</AccentPill>
      </div>
    </header>
  );
}

function greetingForNow(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
