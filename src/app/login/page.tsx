"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ApiError } from "@/client/api";
import { useSession } from "@/client/hooks";
import { Button, Input, Spinner } from "@/components/atoms";
import { GardenIllustration, WelcomeLogo } from "@/components/illustrations";
import { CreateSessionRequestSchema, type CreateSessionRequest } from "@/shared/schemas/user";

type Step = "welcome" | "name";

const WELCOME_GRADIENT =
  "linear-gradient(160deg, var(--color-welcome-from) 0%, var(--color-welcome-via) 60%, var(--color-welcome-to) 100%)";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [step, setStep] = useState<Step>("welcome");
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateSessionRequest>({
    resolver: zodResolver(CreateSessionRequestSchema),
    defaultValues: { name: "" },
    mode: "onSubmit",
  });

  // Subscribe specifically to `name`; the field-level watch is the cheapest form.
  // React Compiler can't memoize through `watch`, but this component is small
  // enough that the trade-off doesn't matter.
  const watchedName = (form.watch("name") ?? "").trim(); // eslint-disable-line react-hooks/incompatible-library
  const firstName = watchedName.split(/\s+/)[0] ?? "";

  const advanceFromWelcome = () => {
    setStep("name");
  };

  const submitName = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values.name);
      router.replace("/today");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      setServerError(message);
    }
  });

  const isWelcome = step === "welcome";
  const tagline = isWelcome
    ? "Grow your best life, one task at a time."
    : "What should we call you?";
  const submitting = form.formState.isSubmitting;
  const buttonLabel = isWelcome
    ? "Start Growing →"
    : submitting
      ? "Signing you in…"
      : firstName
        ? `Let's go, ${firstName}! 🌱`
        : "Continue →";

  const fieldError = form.formState.errors.name?.message ?? serverError;

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-8"
      style={{ background: WELCOME_GRADIENT }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="mb-2 flex justify-center">
          <WelcomeLogo />
        </div>
        <h1 className="text-ink-strong text-3xl font-extrabold tracking-tight">Growth</h1>
        <p className="text-ink-soft mt-1.5 mb-7 text-sm">{tagline}</p>

        <div className="flex justify-center">
          <GardenIllustration />
        </div>

        <form
          className="mt-7 space-y-3"
          onSubmit={(event) => {
            if (isWelcome) {
              event.preventDefault();
              advanceFromWelcome();
              return;
            }
            void submitName(event);
          }}
        >
          {!isWelcome && (
            <div className="text-left">
              <label htmlFor="name" className="sr-only">
                Your name
              </label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Your name…"
                invalid={!!fieldError}
                autoComplete="given-name"
                autoFocus
                disabled={submitting}
                onChange={(e) => {
                  if (serverError) setServerError(null);
                  form.register("name").onChange(e);
                }}
              />
              {fieldError && (
                <p role="alert" className="text-health-critical mt-1 text-xs font-semibold">
                  {fieldError}
                </p>
              )}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" /> Signing you in…
              </span>
            ) : (
              buttonLabel
            )}
          </Button>
        </form>

        <p className="text-ink-faint mt-5 text-xs">
          No account needed · Your data stays on this device
        </p>
      </div>
    </main>
  );
}
