"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "growth_dev_session";
const EVENT = "growth-dev-session-change";

export type DevSession = {
  user: { name: string } | null;
  prioritiesLocked: boolean;
};

const EMPTY: DevSession = { user: null, prioritiesLocked: false };

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read(): DevSession {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "user" in parsed &&
      "prioritiesLocked" in parsed
    ) {
      return parsed as DevSession;
    }
    return EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(next: DevSession): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(callback: () => void): () => void {
  if (!isBrowser()) return () => undefined;
  const onChange = () => callback();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Dev-only session stub. Reads/writes a session blob to localStorage.
 *
 * This is the client-side stand-in for the real API call that lands with the
 * Auth.js + TanStack Query work (PRs 5 + 6). The shape of the return value
 * matches what the future `useSession()` will return, so component call-sites
 * won't change when we swap implementations.
 */
export function useDevSession() {
  const session = useSyncExternalStore<DevSession>(subscribe, read, () => EMPTY);

  const login = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    write({ user: { name: trimmed }, prioritiesLocked: read().prioritiesLocked });
  }, []);

  const logout = useCallback(() => {
    write(EMPTY);
  }, []);

  const lockPriorities = useCallback(() => {
    const current = read();
    if (!current.user) return;
    write({ ...current, prioritiesLocked: true });
  }, []);

  return { ...session, login, logout, lockPriorities };
}
