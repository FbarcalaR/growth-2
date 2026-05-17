"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms";

/**
 * Stash for the `beforeinstallprompt` event Chrome/Edge/Opera fires when a
 * site is installable. The browser only fires the event once per page load,
 * so we have to capture and replay it from a button click.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "growth.install.dismissed";
const COOLDOWN_DAYS = 14;

function wasRecentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISSED_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return false;
  const ageDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return ageDays < COOLDOWN_DAYS;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // Both checks needed: matchMedia is the cross-browser API, but iOS Safari
  // still uses the legacy `navigator.standalone` boolean for installed PWAs.
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPadOS 13+ reports `MacIntel` for navigator.platform but has touch, so the
  // maxTouchPoints check disambiguates. Excludes Macs.
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * Compute once on first render: should we even consider showing the prompt?
 * Returns early `false` when already installed or recently dismissed; the
 * iOS branch derives `iosBanner` synchronously since the platform check is
 * deterministic and doesn't need an effect.
 */
function initialState(): { eligible: boolean; iosBanner: boolean } {
  if (typeof window === "undefined") return { eligible: false, iosBanner: false };
  if (isStandalone() || wasRecentlyDismissed()) return { eligible: false, iosBanner: false };
  return { eligible: true, iosBanner: isIOS() };
}

/**
 * First-visit install nudge. Two paths:
 *   • Chrome / Edge / Android — listen for `beforeinstallprompt`, capture
 *     it, and replay on click of an in-app "Install" button.
 *   • iOS Safari — the event doesn't fire there. Show an instruction
 *     banner ("Tap the Share icon → Add to Home Screen") instead.
 *
 * Dismissal sticks for `COOLDOWN_DAYS`. We also self-suppress when the app
 * is already running in standalone mode (the user installed already).
 */
export function InstallPrompt() {
  // Lazy initial state — computed once on first render so the iOS banner
  // path doesn't need an effect (which would trip the React 19 / Compiler
  // `react-hooks/set-state-in-effect` rule).
  const [eligible] = useState(() => initialState().eligible);
  const [iosBanner] = useState(() => initialState().iosBanner);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!eligible) return undefined;

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setHidden(true);
      // Treat install as a permanent dismissal — no need to nag again.
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [eligible]);

  // Visibility: show the banner when we're eligible AND (the iOS path is
  // active OR Chrome handed us a deferred-install event), and the user
  // hasn't manually dismissed during this session.
  const visible = eligible && !hidden && (iosBanner || installEvent !== null);
  if (!visible) return null;

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    setHidden(true);
    if (choice.outcome === "dismissed") {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
  }

  function handleDismiss() {
    setHidden(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Install Growth"
      // Sit above the bottom nav (which is part of `(app)/layout.tsx`).
      className="bg-surface-card border-surface-muted fixed right-4 bottom-20 left-4 z-40 mx-auto max-w-[440px] rounded-[18px] border-[1.5px] p-3.5 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="bg-brand-700 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-white"
        >
          <Download size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-ink-strong text-[14px] font-extrabold">Install Growth</p>
          {iosBanner ? (
            <p className="text-brand-muted mt-0.5 text-[12px] leading-snug">
              Tap the Share icon and choose{" "}
              <strong className="text-ink-strong">Add to Home Screen</strong> to use Growth like a
              native app.
            </p>
          ) : (
            <p className="text-brand-muted mt-0.5 text-[12px] leading-snug">
              Add it to your home screen for one-tap access — no app store needed.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="text-brand-muted hover:text-brand-700 -mt-1 -mr-1 shrink-0 rounded-md p-1.5"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      {!iosBanner && installEvent && (
        <div className="mt-3 flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="flex-1">
            Not now
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => void handleInstall()}
            className="flex-1"
          >
            Install
          </Button>
        </div>
      )}
    </div>
  );
}
