"use client";

import { useSyncExternalStore } from "react";

/**
 * Pure-client preferences (Story 6.2). Both values persist in `localStorage`
 * under a single key so swapping the storage layer (Auth.js + a `userPrefs`
 * column on the user row in Epic A) is a one-place change.
 *
 *   • `animations` — `"auto"` follows the OS `prefers-reduced-motion`,
 *     `"on"` forces animations even when the OS asked to reduce, `"off"`
 *     suppresses them regardless. Default `"auto"`.
 *   • `accent`    — a hex string applied to the `--color-accent-warm`
 *     CSS var (the warm-gold pill / coin / streak / trophy color). `null`
 *     keeps the design-system default. Default `null`.
 */
export type AppPrefs = {
  animations: "auto" | "on" | "off";
  accent: string | null;
};

const STORAGE_KEY = "growth.app-prefs.v1";
const DEFAULT_PREFS: AppPrefs = { animations: "auto", accent: null };

/**
 * Curated palette for the accent picker. The keys are display labels;
 * the values are hex literals applied as `--color-accent-warm`. The first
 * entry uses the design-system default (warm-gold) — picking it clears the
 * override.
 */
export const ACCENT_OPTIONS: ReadonlyArray<{ label: string; hex: string | null }> = [
  { label: "Default", hex: null },
  { label: "Sage", hex: "#66BB6A" },
  { label: "Sky", hex: "#42A5F5" },
  { label: "Coral", hex: "#EC407A" },
  { label: "Lavender", hex: "#AB47BC" },
];

const listeners = new Set<() => void>();

/**
 * Cached snapshot — `useSyncExternalStore` requires `getSnapshot` to return
 * a stable reference for the same underlying state. Without this cache,
 * each call returns a freshly-allocated object, React detects "the result
 * of getSnapshot should be cached" and re-renders forever.
 */
let cachedSnapshot: AppPrefs | undefined;

function readStorageRaw(): AppPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<AppPrefs>;
    return {
      animations: parsed.animations ?? "auto",
      accent: typeof parsed.accent === "string" ? parsed.accent : null,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function getSnapshot(): AppPrefs {
  if (!cachedSnapshot) cachedSnapshot = readStorageRaw();
  return cachedSnapshot;
}

function writeStorage(next: AppPrefs): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function applyAccent(accent: string | null): void {
  if (typeof document === "undefined") return;
  if (accent) document.documentElement.style.setProperty("--color-accent-warm", accent);
  else document.documentElement.style.removeProperty("--color-accent-warm");
}

function getServerSnapshot(): AppPrefs {
  return DEFAULT_PREFS;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** Read the current preferences (reactive — re-renders when `update` is called). */
export function useAppPrefs(): AppPrefs {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Persist a partial update + apply side-effects (CSS var for accent) +
 * notify subscribers. Stays a plain function so call sites don't need a hook.
 */
export function updateAppPrefs(patch: Partial<AppPrefs>): void {
  const current = getSnapshot();
  const next: AppPrefs = { ...current, ...patch };
  writeStorage(next);
  cachedSnapshot = next;
  if (patch.accent !== undefined) applyAccent(next.accent);
  for (const cb of listeners) cb();
}

/**
 * Apply the persisted accent override at boot. Mount-once in the app shell
 * so a hard refresh doesn't lose the user's pick. (FOUC: a single first paint
 * may show the default before the effect runs — acceptable for this surface.)
 */
export function hydrateAccentOnMount(): void {
  applyAccent(getSnapshot().accent);
}
