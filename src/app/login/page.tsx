"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ApiError } from "@/client/api";
import { useSession } from "@/client/hooks";
import { Button, Input } from "@/components/atoms";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Tell us what to call you.");
      return;
    }
    setSubmitting(true);
    try {
      await login(trimmed);
      router.replace("/today");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-surface-frame flex min-h-screen items-center justify-center px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-app text-brand-700 w-full max-w-sm space-y-5 rounded-xl p-8 shadow-xl"
      >
        <header className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Welcome to Growth</h1>
          <p className="text-brand-muted text-sm">
            What should we call you? You can change this later in your profile.
          </p>
        </header>

        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-bold tracking-wider uppercase">
            Your name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ada Lovelace"
            invalid={!!error}
            autoComplete="given-name"
            autoFocus
            disabled={submitting}
          />
          {error && (
            <p role="alert" className="text-health-critical text-xs font-semibold">
              {error}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Signing you in…" : "Get started"}
        </Button>
      </form>
    </main>
  );
}
