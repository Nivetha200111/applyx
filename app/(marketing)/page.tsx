import { redirect } from "next/navigation";
import { ImmersiveLanding } from "@/components/marketing/immersive-landing";
import { getCurrentUser } from "@/lib/auth";

export default async function MarketingHomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <ImmersiveLanding />;
}
