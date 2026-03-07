"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface OAuthButtonProps {
  label: string;
  next?: string;
}

export function OAuthButton({
  label,
  next = "/dashboard",
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleSignIn() {
    setIsLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: next.startsWith("/") ? next : "/dashboard",
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  }

  return (
    <Button
      className="w-full"
      disabled={isLoading}
      onClick={handleGoogleSignIn}
      type="button"
      variant="outline"
    >
      {isLoading ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Redirecting to Google...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
