"use client";

import { RefreshCw, X } from "lucide-react";

import { useDeploymentVersion } from "@/client/hooks";
import { Button } from "@/components/atoms";

/**
 * "A new version is available" banner. Polls `/api/version` every 5 minutes
 * (see `useDeploymentVersion`); when the SHA changes vs. the one captured
 * at mount, shows a small banner above the bottom-nav with a Refresh CTA.
 *
 * Refresh: `location.reload()` is the simplest — Next.js's static asset
 * cache is content-hashed so the browser refetches fresh chunks. No SW
 * to coordinate.
 *
 * Dismissal stores the new SHA in localStorage so a user who taps "Later"
 * and then refreshes the page doesn't get re-nagged for the same build.
 */
export function UpdateAvailableBanner() {
  const { updateAvailable, dismiss } = useDeploymentVersion();
  if (!updateAvailable) return null;

  function handleRefresh() {
    // Hard reload bypasses bfcache + service-worker caches. Clears the
    // in-memory React Query cache too because the page is re-mounted.
    window.location.reload();
  }

  return (
    <div
      role="dialog"
      aria-label="New version available"
      // Sit above the install prompt (z-40) and the bottom nav.
      className="bg-brand-700 fixed right-4 bottom-20 left-4 z-50 mx-auto flex max-w-[440px] items-center gap-3 rounded-[18px] p-3 text-white shadow-lg"
    >
      <span
        aria-hidden
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/15"
      >
        <RefreshCw size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-extrabold">A new version is available</p>
        <p className="mt-0.5 text-[11px] leading-snug text-white/85">
          Refresh to pick up the latest changes.
        </p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={handleRefresh}
        className="shrink-0 bg-white/15 text-white hover:bg-white/25"
      >
        Refresh
      </Button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss update prompt"
        className="-mr-1 shrink-0 rounded-md p-1 text-white/70 hover:text-white"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}
