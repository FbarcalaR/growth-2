"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useDevSession } from "@/client/dev/use-dev-session";
import { BottomNav } from "@/components/organisms";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useDevSession();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) {
    // Render nothing while redirecting; avoids a frame of authed UI.
    return null;
  }

  return (
    <div className="bg-surface-frame text-brand-700 flex min-h-screen justify-center">
      <div className="bg-surface-app flex w-full max-w-[480px] flex-col shadow-xl">
        <main className="flex-1 overflow-y-auto">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
