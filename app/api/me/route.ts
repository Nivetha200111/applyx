import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getRemainingTailors, refreshUserAccess } from "@/lib/data";
import { isUnlimitedPlan } from "@/lib/plans";

/**
 * Lightweight endpoint that returns the current user's sidebar data.
 * Called client-side by the sidebar so the dashboard layout can be
 * fully synchronous (instant skeleton rendering).
 */
export async function GET() {
  const rawUser = await getCurrentUser();

  if (!rawUser) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = await refreshUserAccess(rawUser);
  const remaining = getRemainingTailors(user);
  const developerAdmin = isDeveloperAdminUser(user);

  const planLabel = developerAdmin
    ? "Developer access"
    : `${user.plan[0].toUpperCase()}${user.plan.slice(1)} plan`;

  const usageLabel = developerAdmin
    ? "Premium features unlocked. Billing bypass is active for this account."
    : user.plan === "free"
    ? `${remaining} free demos remaining.`
    : isUnlimitedPlan(user.monthlyTailorLimit)
      ? `Unlimited tailors. ${user.monthlyTailorsUsed} used this cycle.`
      : `${remaining} of ${user.monthlyTailorLimit} tailors remaining this billing cycle.`;

  return NextResponse.json({
    userName: user.fullName,
    planLabel,
    usageLabel,
  });
}

