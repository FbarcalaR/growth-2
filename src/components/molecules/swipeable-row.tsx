"use client";

import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/client/lib/cn";

export type SwipeAction = {
  /** Visible label (also the accessible label / tooltip). */
  label: string;
  /** ReactNode rendered above the label — usually a lucide icon. */
  icon: ReactNode;
  /** Background colour of the action panel. Use a strong colour. */
  color: string;
  onClick: () => void;
};

type SwipeableRowProps = {
  /** Rendered as the foreground row content. Click fires `onPress`. */
  children: ReactNode;
  /** Right-side action buttons revealed when the user swipes left. */
  actions: SwipeAction[];
  /** Tap-on-body handler. Suppressed if the user just swiped. */
  onPress?: () => void;
  className?: string;
};

const ACTION_W = 64;

/**
 * Mobile-first row that hides per-row action buttons behind it. The user
 * swipes left to reveal them; tapping the body (when not swiped) fires
 * `onPress`. Ported from the prototype's `SwipeableItemRow`.
 *
 * Touch-only swipe in this round — pointer-drag on desktop is documented as
 * a follow-up. Keyboard users can still trigger actions via tab focus
 * because the action buttons remain rendered (just hidden behind the row).
 */
export function SwipeableRow({ children, actions, onPress, className }: SwipeableRowProps) {
  const totalActionWidth = actions.length * ACTION_W;
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const moved = useRef(false);
  const horizontal = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    moved.current = false;
    horizontal.current = false;
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startX.current === null || startY.current === null) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;
    if (!horizontal.current && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      horizontal.current = true;
    }
    if (horizontal.current) {
      moved.current = true;
      const base = open ? -totalActionWidth : 0;
      const next = Math.max(-totalActionWidth, Math.min(0, base + dx));
      setDragX(next);
    }
  }

  function onTouchEnd() {
    if (horizontal.current) {
      if (dragX < -totalActionWidth / 2) {
        setOpen(true);
        setDragX(-totalActionWidth);
      } else {
        setOpen(false);
        setDragX(0);
      }
    }
    startX.current = null;
    startY.current = null;
    setDragging(false);
  }

  function handleClick() {
    if (moved.current) {
      moved.current = false;
      return;
    }
    if (open) {
      setOpen(false);
      setDragX(0);
      return;
    }
    onPress?.();
  }

  return (
    <div
      className={cn("bg-surface-card relative overflow-hidden rounded-md", className)}
      data-state={open ? "open" : "closed"}
    >
      {/* Action panel sits behind the row; revealed when the row slides left. */}
      <div
        className="absolute inset-y-0 right-0 flex items-stretch"
        style={{ width: totalActionWidth }}
      >
        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            aria-label={action.label}
            title={action.label}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              setOpen(false);
              setDragX(0);
            }}
            style={{ width: ACTION_W, background: action.color }}
            className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-white"
          >
            <span aria-hidden className="text-base leading-none">
              {action.icon}
            </span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Foreground row. Slides left under the user's thumb. */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleClick}
        className="relative cursor-pointer touch-pan-y"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 180ms ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
