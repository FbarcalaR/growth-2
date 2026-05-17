"use client";

import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 5 * 60_000; // every 5 minutes
const VERSION_ENDPOINT = "/api/version";
const DISMISSED_SHA_KEY = "growth.update.dismissed-sha";

type Version = { sha: string };

async function fetchVersion(signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(VERSION_ENDPOINT, { cache: "no-store", signal });
    if (!res.ok) return null;
    const body = (await res.json()) as Version;
    return body.sha ?? null;
  } catch {
    return null;
  }
}

/**
 * Watch the build identifier exposed at `/api/version`. Returns whether a
 * new deployment is available since the tab booted, and a dismiss helper
 * for the banner.
 *
 * Detection: capture the SHA on first successful fetch, then re-poll every
 * five minutes. If the new SHA differs and isn't the one the user already
 * dismissed (stored in localStorage so a refresh doesn't re-show the
 * banner immediately), surface `updateAvailable`.
 *
 * Local dev / preview deploys without `VERCEL_GIT_COMMIT_SHA` always
 * return `"dev"` and never trigger the banner — the comparison is stable
 * across page loads.
 */
export function useDeploymentVersion(): {
  updateAvailable: boolean;
  newSha: string | null;
  dismiss: () => void;
} {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newSha, setNewSha] = useState<string | null>(null);
  const initialSha = useRef<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let timer: ReturnType<typeof setInterval> | null = null;

    async function check() {
      const sha = await fetchVersion(ctrl.signal);
      if (!sha) return;

      // First successful fetch — record the baseline and let the banner
      // start watching from here on.
      if (initialSha.current === null) {
        initialSha.current = sha;
        return;
      }

      if (sha === initialSha.current) return;

      // Suppress if the user already dismissed this exact SHA (avoids
      // re-popping the banner after they tapped "Later" + refreshed).
      const dismissed = window.localStorage.getItem(DISMISSED_SHA_KEY);
      if (dismissed === sha) return;

      setNewSha(sha);
      setUpdateAvailable(true);
    }

    void check();
    timer = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      ctrl.abort();
      if (timer) clearInterval(timer);
    };
  }, []);

  function dismiss() {
    if (newSha) window.localStorage.setItem(DISMISSED_SHA_KEY, newSha);
    setUpdateAvailable(false);
  }

  return { updateAvailable, newSha, dismiss };
}
