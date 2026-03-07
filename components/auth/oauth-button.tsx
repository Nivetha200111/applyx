"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

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

    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", next.startsWith("/") ? next : "/dashboard");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
      },
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
          Redirecting...
        </>
      ) : (
        label
      )}
    </Button>
  );
}
