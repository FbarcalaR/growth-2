"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useSession } from "@/client/hooks";
import { BottomNav, SetPrioritiesModal } from "@/components/organisms";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading, prioritiesLocked } = useSession();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    // Render nothing while resolving the session — avoids a flash of authed UI
    // (or, when unauthenticated, a flash before the redirect lands).
    return null;
  }

  return (
    <div className="bg-surface-frame text-brand-700 flex min-h-screen justify-center">
      <div className="bg-surface-app flex w-full max-w-[480px] flex-col shadow-xl">
        <main className="flex-1 overflow-y-auto">{children}</main>
        <BottomNav />
      </div>
      {/* Priorities modal overlays the entire shell while the user hasn't
          locked their wheel yet. It's `dismissable={false}` so the user can't
          escape onboarding without committing. */}
      <SetPrioritiesModal open={!prioritiesLocked} initial={user.wheelOfLife} />
    </div>
  );
}
