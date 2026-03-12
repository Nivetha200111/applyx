import { redirect } from "next/navigation";
import { ImmersiveLanding } from "@/components/marketing/immersive-landing";
import { hasSessionCookie } from "@/lib/auth";

export default function MarketingHomePage() {
  // Fast synchronous cookie check instead of getCurrentUser() DB query.
  // If the session cookie exists the user is *probably* logged in — redirect
  // to dashboard where the real auth check happens. This avoids a DB
  // round-trip on every anonymous landing page visit.
  if (hasSessionCookie()) {
    redirect("/dashboard");
  }

  return <ImmersiveLanding />;
}
