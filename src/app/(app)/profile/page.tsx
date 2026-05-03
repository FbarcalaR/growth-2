"use client";

import { Coins, Flame, LogOut, Pencil, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useGoals, useSession } from "@/client/hooks";
import { Avatar, Button, Input, Modal } from "@/components/atoms";
import { PageHeader } from "@/components/molecules";

import { ResetAction } from "./_components/reset-action";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateName, logout } = useSession();
  const goals = useGoals();
  const [editing, setEditing] = useState(false);

  if (!user) {
    return (
      <section className="flex min-h-full items-center justify-center px-6 py-16">
        <p className="text-brand-muted text-sm">Loading…</p>
      </section>
    );
  }

  async function handleSignOut() {
    await logout();
    router.replace("/login");
  }

  const goalsCount = goals.data?.length ?? 0;

  return (
    <section className="flex flex-col gap-4 px-5 pt-5 pb-10">
      <PageHeader title="Profile" description="Your name, totals, and settings." />

      <div className="bg-surface-card border-surface-muted flex items-center gap-3 rounded-[20px] border-[1.5px] p-4">
        <Avatar name={user.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-ink-strong truncate text-[18px] font-extrabold">{user.name}</p>
          <p className="text-brand-muted text-[12px]">
            Signed in since {formatJoined(user.createdAt)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
          leadingIcon={<Pencil size={14} aria-hidden />}
          className="rounded-[12px]"
        >
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label="Coins earned"
          value={user.totalCoinsEarned}
          icon={<Coins size={16} aria-hidden />}
          tone="warm"
        />
        <StatCard
          label="Day streak"
          value={user.streak}
          icon={<Flame size={16} aria-hidden />}
          tone="warm"
        />
        <StatCard
          label="Goals"
          value={goalsCount}
          icon={<Target size={16} aria-hidden />}
          tone="brand"
        />
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <ResetAction />
        <Button
          variant="outline-destructive"
          size="lg"
          onClick={handleSignOut}
          leadingIcon={<LogOut size={14} aria-hidden />}
          className="w-full rounded-[14px]"
        >
          Sign out
        </Button>
      </div>

      <EditNameDialog
        open={editing}
        currentName={user.name}
        onClose={() => setEditing(false)}
        onSubmit={async (name) => {
          await updateName(name);
          setEditing(false);
        }}
      />
    </section>
  );
}

function formatJoined(createdAt: number): string {
  if (!createdAt) return "today";
  return new Date(createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

type StatTone = "brand" | "warm";

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone: StatTone;
}) {
  const valueClass = tone === "warm" ? "text-accent-warm" : "text-brand-700";
  return (
    <div className="bg-surface-card border-surface-muted rounded-[14px] border-[1.5px] px-3 py-3 text-center">
      <span aria-hidden className={`inline-flex items-center justify-center ${valueClass}`}>
        {icon}
      </span>
      <p className={`mt-1 text-[18px] font-extrabold tabular-nums ${valueClass}`}>{value}</p>
      <p className="text-brand-muted mt-0.5 text-[10px] font-bold tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}

type EditNameDialogProps = {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

function EditNameDialog({ open, currentName, onClose, onSubmit }: EditNameDialogProps) {
  const [name, setName] = useState(currentName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the field every time the dialog re-opens so a previous edit doesn't
  // bleed into the next one. Cheap to do because state lives only when open.
  if (open && submitting === false && name !== currentName && name === "") {
    setName(currentName);
  }

  const trimmed = name.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= 80;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your name.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit your name">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <p className="text-ink-strong text-[18px] font-extrabold">Edit your name</p>
        <label className="text-brand-muted text-[12px] font-semibold">
          Display name
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            autoFocus
            invalid={!valid && name.length > 0}
            className="mt-1"
          />
        </label>
        {error && <p className="text-health-critical text-[12px]">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={!valid || submitting}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
