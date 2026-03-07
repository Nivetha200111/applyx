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
import { signUpSchema } from "@/lib/validations/auth";

interface SignupFormProps {
  next: string;
}

export function SignupForm({ next }: SignupFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      fullName: formData.get("full_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      next,
    });

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Invalid sign up details.");
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.signUp.email({
        name: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: next,
      });

      if (error) {
        setErrorMessage(error.message ?? "Sign up failed.");
        return;
      }

      toast.success("Account created. You are now signed in.");
      router.replace(next);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {errorMessage ? <AuthMessage message={errorMessage} tone="error" /> : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="full-name">
            Full name
          </label>
          <Input
            autoComplete="name"
            id="full-name"
            name="full_name"
            placeholder="Nivetha Raman"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-email">
            Email
          </label>
          <Input
            autoComplete="email"
            id="signup-email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-password">
            Password
          </label>
          <Input
            autoComplete="new-password"
            id="signup-password"
            minLength={8}
            name="password"
            placeholder="Create a password"
            required
            type="password"
          />
        </div>
        <SubmitButton
          className="w-full"
          isPending={isPending}
          pendingLabel="Creating account..."
          type="submit"
        >
          Create account
        </SubmitButton>
      </form>
      <OAuthButton label="Sign up with Google" next={next} />
    </div>
  );
}
