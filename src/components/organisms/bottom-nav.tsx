"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/client/lib/cn";
import { TabIcon, type TabKey } from "@/components/icons/tab-icon";

type Tab = {
  href: string;
  key: TabKey;
  label: string;
};

const TABS: Tab[] = [
  { href: "/today", key: "today", label: "Today" },
  { href: "/garden", key: "garden", label: "Garden" },
  { href: "/history", key: "history", label: "History" },
  { href: "/profile", key: "profile", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="bg-surface-card/95 border-surface-muted flex border-t px-1 py-2 backdrop-blur-md"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 transition-transform",
              "active:scale-95",
              "focus-visible:ring-brand-700 rounded-md focus-visible:ring-2 focus-visible:outline-none",
              active ? "text-brand-700" : "text-brand-muted",
            )}
          >
            <TabIcon tab={tab.key} />
            <span className={cn("text-[10px]", active ? "font-bold" : "font-medium")}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
