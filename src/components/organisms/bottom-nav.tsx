"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/client/lib/cn";

type Tab = {
  href: string;
  label: string;
  icon: (active: boolean) => ReactNode;
};

const STROKE_ACTIVE = "var(--color-brand-700)";
const STROKE_INACTIVE = "var(--color-brand-muted)";
const FILL_ACTIVE = "var(--color-brand-100)";
const ACCENT_DOT = "var(--color-brand-500)";

const TABS: Tab[] = [
  {
    href: "/today",
    label: "Today",
    icon: (active) => {
      const stroke = active ? STROKE_ACTIVE : STROKE_INACTIVE;
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <rect
            x="3"
            y="4"
            width="16"
            height="15"
            rx="3.5"
            stroke={stroke}
            strokeWidth="1.8"
            fill={active ? FILL_ACTIVE : "none"}
          />
          <line
            x1="7"
            y1="2"
            x2="7"
            y2="6"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="15"
            y1="2"
            x2="15"
            y2="6"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <polyline
            points="7,12 9.5,14.5 15,9"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    },
  },
  {
    href: "/garden",
    label: "Garden",
    icon: (active) => {
      const stroke = active ? STROKE_ACTIVE : STROKE_INACTIVE;
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <path d="M11,19 L11,11" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M11,12 C8,12 5.5,10 5,7 C8,7 10.5,9 11,12 Z"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill={active ? FILL_ACTIVE : "none"}
          />
          <path
            d="M11,10 C14,10 16.5,8 17,5 C14,5 11.5,7 11,10 Z"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill={active ? FILL_ACTIVE : "none"}
          />
          <line
            x1="4"
            y1="19"
            x2="18"
            y2="19"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    },
  },
  {
    href: "/history",
    label: "History",
    icon: (active) => {
      const stroke = active ? STROKE_ACTIVE : STROKE_INACTIVE;
      const dot = active ? STROKE_ACTIVE : STROKE_INACTIVE;
      const accentDot = active ? ACCENT_DOT : STROKE_INACTIVE;
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <rect
            x="3"
            y="5"
            width="16"
            height="14"
            rx="3"
            stroke={stroke}
            strokeWidth="1.8"
            fill={active ? FILL_ACTIVE : "none"}
          />
          <line
            x1="7"
            y1="3"
            x2="7"
            y2="7"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="15"
            y1="3"
            x2="15"
            y2="7"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line x1="3" y1="9" x2="19" y2="9" stroke={stroke} strokeWidth="1.4" />
          <circle cx="7" cy="13" r="1.4" fill={dot} />
          <circle cx="11" cy="13" r="1.4" fill={accentDot} />
          <circle cx="15" cy="13" r="1.4" stroke={dot} strokeWidth="1.2" fill="none" />
          <circle cx="7" cy="16.5" r="1.4" stroke={dot} strokeWidth="1.2" fill="none" />
          <circle cx="11" cy="16.5" r="1.4" fill={dot} />
        </svg>
      );
    },
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active) => {
      const stroke = active ? STROKE_ACTIVE : STROKE_INACTIVE;
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle
            cx="11"
            cy="8"
            r="4"
            stroke={stroke}
            strokeWidth="1.8"
            fill={active ? FILL_ACTIVE : "none"}
          />
          <path
            d="M3,19.5 C3,15.5 6.5,13 11,13 C15.5,13 19,15.5 19,19.5"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
    },
  },
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
            )}
          >
            {tab.icon(!!active)}
            <span
              className={cn(
                "text-[10px]",
                active ? "text-brand-700 font-bold" : "text-brand-muted font-medium",
              )}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
