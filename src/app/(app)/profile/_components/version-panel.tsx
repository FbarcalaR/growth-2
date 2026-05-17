"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/atoms";

// Wired through `next.config.ts` (`env.NEXT_PUBLIC_BUILD_SHA`). Falls back
// to "dev" when not on Vercel so local builds don't trigger a false
// "update available" the first time someone clicks the button.
const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev";

type CheckState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "up-to-date" }
  | { kind: "update-available"; latest: string }
  | { kind: "error"; message: string };

/**
 * Manual "Check for updates" panel. Shows the bundled build SHA and on
 * click hits `/api/version`; if the runtime SHA differs from the one
 * baked into this bundle, the button flips into a Refresh CTA.
 *
 * No polling — the user is in control. Skips the check entirely when
 * the bundled SHA is "dev" so local builds don't pretend to be stale.
 */
export function VersionPanel() {
  const [state, setState] = useState<CheckState>({ kind: "idle" });

  async function handleCheck() {
    if (state.kind === "update-available") {
      window.location.reload();
      return;
    }
    setState({ kind: "checking" });
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { sha?: string };
      const latest = data.sha ?? "dev";
      if (latest === BUILD_SHA || BUILD_SHA === "dev") {
        setState({ kind: "up-to-date" });
      } else {
        setState({ kind: "update-available", latest });
      }
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not check for updates.",
      });
    }
  }

  const buttonLabel = (() => {
    switch (state.kind) {
      case "checking":
        return "Checking…";
      case "update-available":
        return "Refresh to update";
      case "up-to-date":
        return "Check again";
      case "error":
        return "Try again";
      case "idle":
      default:
        return "Check for updates";
    }
  })();

  return (
    <div className="bg-surface-card border-surface-muted rounded-[14px] border-[1.5px] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-brand-muted text-[10px] font-bold tracking-wide uppercase">Version</p>
          <p className="text-ink-strong mt-0.5 font-mono text-[13px] font-bold">
            {BUILD_SHA.slice(0, 7)}
          </p>
        </div>
        <Button
          variant={state.kind === "update-available" ? "primary" : "outline"}
          size="sm"
          onClick={handleCheck}
          disabled={state.kind === "checking"}
          leadingIcon={<RefreshCw size={14} aria-hidden />}
          className="shrink-0 rounded-[12px]"
        >
          {buttonLabel}
        </Button>
      </div>

      {state.kind === "update-available" && (
        <p className="text-accent-warm mt-3 text-[12px] font-semibold">
          A new version is available. Refreshing the app is recommended to pick up the latest
          changes.
        </p>
      )}
      {state.kind === "up-to-date" && (
        <p className="text-brand-muted mt-3 text-[12px]">You&apos;re on the latest version.</p>
      )}
      {state.kind === "error" && (
        <p className="text-health-critical mt-3 text-[12px]">
          Couldn&apos;t check for updates: {state.message}
        </p>
      )}
    </div>
  );
}
