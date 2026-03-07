"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthMessage } from "@/components/auth/auth-message";
import { OAuthButton } from "@/components/auth/oauth-button";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/lib/validations/auth";

interface LoginFormProps {
  next: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next,
    });

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Invalid sign in details.");
      return;
    }

    startTransition(async () => {
      const result = await authClient.signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: next,
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Sign in failed.");
        return;
      }

      toast.success("Signed in successfully.");
      router.replace(result.data?.url ?? next);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {errorMessage ? <AuthMessage message={errorMessage} tone="error" /> : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            autoComplete="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            autoComplete="current-password"
            id="password"
            minLength={8}
            name="password"
            placeholder="Enter your password"
            required
            type="password"
          />
        </div>
        <SubmitButton
          className="w-full"
          isPending={isPending}
          pendingLabel="Signing in..."
          type="submit"
        >
          Continue
        </SubmitButton>
      </form>
      <OAuthButton label="Continue with Google" next={next} />
    </div>
  );
}
