"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useDevSession } from "@/client/dev/use-dev-session";
import { Button, Input } from "@/components/atoms";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useDevSession();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Tell us what to call you.");
      return;
    }
    login(trimmed);
    router.replace("/today");
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
          />
          {error && (
            <p role="alert" className="text-health-critical text-xs font-semibold">
              {error}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full">
          Get started
        </Button>
      </form>
    </main>
  );
}
