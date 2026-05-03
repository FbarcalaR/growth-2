"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/atoms";

/**
 * Next.js segment-level error boundary. Catches runtime exceptions thrown
 * during render in `/app/**` route segments and offers a recover-with-reset
 * affordance instead of a blank screen. Mirrors the prototype's defensive
 * shell — the Today list / Garden grid don't ship anything as a hard
 * dependency, so any thrown error is routed through here.
 *
 * Logged via `console.error` so production observability tooling (Sentry,
 * Datadog, etc., once we add it) can pick the trace up. Story 8.2.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Production observability hook. Replace with Sentry / Datadog when we
    // wire one in (Epic A's persistence rollout is the natural moment).
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <section className="flex min-h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div aria-hidden className="text-4xl">
        🥀
      </div>
      <h1 className="text-ink-strong text-lg font-extrabold">Something wilted in the page</h1>
      <p className="text-brand-muted max-w-sm text-sm">
        We hit an unexpected error rendering this view. Try again — your data is safe on the server.
      </p>
      {error.digest && (
        <p className="text-brand-muted/70 font-mono text-[10px]">Reference: {error.digest}</p>
      )}
      <Button
        variant="primary"
        size="md"
        onClick={() => reset()}
        leadingIcon={<RotateCcw size={14} aria-hidden />}
        className="mt-2 rounded-[14px]"
      >
        Try again
      </Button>
    </section>
  );
}
