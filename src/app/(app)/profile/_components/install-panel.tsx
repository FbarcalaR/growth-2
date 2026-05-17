"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms";

/**
 * `beforeinstallprompt` is the Chrome/Edge/Android contract for replaying the
 * native install UI from a button click. Only fires once per page load and
 * only when the browser considers the site installable.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari uses the legacy `navigator.standalone` boolean instead of the
  // matchMedia query, so we need both checks to spot an installed PWA.
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

/**
 * Profile-tab "Install app" panel. The first-visit `<InstallPrompt>` nudge
 * disappears after the user dismisses it (14-day cooldown) and is gone
 * forever once the app is uninstalled mid-session, so we surface a
 * persistent control here too. Three paths:
 *   • App already installed (standalone) → button disabled, "Installed".
 *   • Chrome / Android with a captured `beforeinstallprompt` → enabled
 *     button that replays the native install dialog.
 *   • iOS Safari → button disabled with Share → Add to Home Screen copy.
 */
export function InstallPanel() {
  const [standalone, setStandalone] = useState(() => detectStandalone());
  const [isIOS] = useState(() => detectIOS());
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setStandalone(true);
      setInstallEvent(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setStandalone(true);
    setInstallEvent(null);
  }

  const helper = (() => {
    if (standalone) {
      return "Growth is installed on this device.";
    }
    if (isIOS) {
      return "Tap the Share icon and choose Add to Home Screen.";
    }
    if (!installEvent) {
      return "Install isn't available right now. Refresh the page if you previously dismissed the prompt.";
    }
    return "Add Growth to your home screen for one-tap access — no app store needed.";
  })();

  const buttonLabel = standalone ? "Installed" : "Install app";
  const disabled = standalone || (!installEvent && !isIOS) || isIOS;

  return (
    <div className="bg-surface-card border-surface-muted rounded-[14px] border-[1.5px] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-brand-muted text-[10px] font-bold tracking-wide uppercase">App</p>
          <p className="text-ink-strong mt-0.5 text-[13px] font-bold">
            {standalone ? "Installed" : "Add to home screen"}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => void handleInstall()}
          disabled={disabled}
          leadingIcon={<Download size={14} aria-hidden />}
          className="shrink-0 rounded-[12px]"
        >
          {buttonLabel}
        </Button>
      </div>
      <p className="text-brand-muted mt-3 text-[12px] leading-snug">{helper}</p>
    </div>
  );
}
