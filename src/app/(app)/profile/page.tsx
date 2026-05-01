"use client";

import { useRouter } from "next/navigation";

import { useSession } from "@/client/hooks";
import { Avatar, Button } from "@/components/atoms";

import { PlaceholderPage } from "../_placeholder";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useSession();

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <PlaceholderPage
      tab="profile"
      title="Profile"
      description="Your name, totals, and settings."
      comingIn="Epic 6"
    >
      {user && (
        <div className="bg-surface-card flex items-center gap-3 rounded-md p-4">
          <Avatar name={user.name} size="lg" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-brand-muted text-xs">
              {user.shopCoins} coins · streak {user.streak}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      )}
    </PlaceholderPage>
  );
}
