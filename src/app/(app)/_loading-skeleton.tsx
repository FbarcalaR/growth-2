import { Spinner } from "@/components/atoms";

/**
 * Rendered by `(app)/layout.tsx` while `useSession()` is pending. A soft
 * sheet-bg fill with a centred spinner — avoids the flash of dark
 * `surface-frame` on cold loads, and tells the user something is happening
 * before the content arrives.
 */
export function AppShellSkeleton() {
  return (
    <div
      className="bg-surface-frame flex min-h-screen justify-center"
      role="status"
      aria-label="Loading the app shell"
    >
      <div className="bg-surface-app flex w-full max-w-[480px] flex-col items-center justify-center shadow-xl">
        <Spinner size="lg" className="text-brand-muted" />
      </div>
    </div>
  );
}
