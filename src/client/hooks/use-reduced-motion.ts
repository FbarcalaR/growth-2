"use client";

import { useSyncExternalStore } from "react";

import { useAppPrefs } from "./use-app-prefs";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Reactive `prefers-reduced-motion: reduce` reader, layered with the user's
 * Profile-tab "Resource animations" override (`auto` / `on` / `off`).
 *
 *   off   → always reduced (highest priority — explicit opt-out)
 *   on    → never reduced (overrides the OS)
 *   auto  → defer to the OS media query (default)
 *
 * Components stay simple: read this hook and either play or skip the motion.
 */
export function useReducedMotion(): boolean {
  const osReduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { animations } = useAppPrefs();
  if (animations === "off") return true;
  if (animations === "on") return false;
  return osReduced;
}
