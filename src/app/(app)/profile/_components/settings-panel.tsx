"use client";

import { Sparkles } from "lucide-react";

import { ACCENT_OPTIONS, updateAppPrefs, useAppPrefs } from "@/client/hooks";
import type { AppPrefs } from "@/client/hooks";

const ANIMATION_OPTIONS: ReadonlyArray<{ value: AppPrefs["animations"]; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

/**
 * Story 6.2 — Profile-tab "Settings" card. Two purely-client preferences,
 * persisted to `localStorage` via `useAppPrefs`:
 *
 *   • Resource animations — auto / on / off. `auto` defers to the OS's
 *     `prefers-reduced-motion` media query. `useReducedMotion()` reads the
 *     combined value, so flipping this here immediately stops the row-toggle
 *     animation on the next interaction.
 *   • Accent color — five-swatch picker that overrides `--color-accent-warm`
 *     at the document root. The "Default" swatch removes the override.
 */
export function SettingsPanel() {
  const prefs = useAppPrefs();

  return (
    <section
      aria-label="Settings"
      className="bg-surface-card border-surface-muted rounded-[18px] border-[1.5px]"
    >
      <header className="flex items-center gap-2 border-b border-[#F0F4EC] px-4 py-3">
        <Sparkles size={14} aria-hidden className="text-brand-muted" />
        <p className="text-brand-muted text-[10px] font-bold tracking-wide uppercase">Settings</p>
      </header>

      <div className="flex items-center justify-between gap-3 border-b border-[#F0F4EC] px-4 py-3">
        <div className="min-w-0">
          <p className="text-ink-strong text-[13.5px] font-bold">Resource animations</p>
          <p className="text-brand-muted mt-0.5 text-[11px]">
            Auto follows your system&apos;s reduce-motion setting.
          </p>
        </div>
        <div className="flex shrink-0 rounded-[10px] bg-[#E8EDE5] p-0.5">
          {ANIMATION_OPTIONS.map((opt) => {
            const active = prefs.animations === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateAppPrefs({ animations: opt.value })}
                aria-pressed={active}
                className={`rounded-[8px] px-3 py-1 text-[11px] font-bold transition-colors ${
                  active ? "bg-surface-card text-ink-strong shadow-sm" : "text-brand-muted"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-ink-strong text-[13.5px] font-bold">Accent color</p>
          <p className="text-brand-muted mt-0.5 text-[11px]">
            Tints the warm-gold pills (coins, streak, trophies).
          </p>
        </div>
        <div
          className="flex shrink-0 items-center gap-1.5"
          role="radiogroup"
          aria-label="Accent color"
        >
          {ACCENT_OPTIONS.map((opt) => {
            const active = (prefs.accent ?? null) === opt.hex;
            return (
              <button
                key={opt.label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => updateAppPrefs({ accent: opt.hex })}
                title={opt.label}
                aria-label={opt.label}
                className={`h-6 w-6 rounded-full border-[1.5px] transition-shadow ${
                  active ? "ring-brand-700 ring-2 ring-offset-2" : ""
                }`}
                style={{
                  background: opt.hex ?? "var(--color-accent-warm)",
                  borderColor: active ? "var(--color-brand-700)" : "rgba(0,0,0,0.08)",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
