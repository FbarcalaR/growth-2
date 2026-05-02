import { CalendarCheck, CalendarDays, Sprout, User, type LucideIcon } from "lucide-react";

export type TabKey = "today" | "garden" | "history" | "profile";

export const TAB_ICONS: Record<TabKey, LucideIcon> = {
  today: CalendarCheck,
  garden: Sprout,
  history: CalendarDays,
  profile: User,
};

type TabIconProps = {
  tab: TabKey;
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
};

export function TabIcon({ tab, size = 22, className, ...props }: TabIconProps) {
  const Icon = TAB_ICONS[tab];
  return <Icon size={size} strokeWidth={1.8} className={className} aria-hidden {...props} />;
}
