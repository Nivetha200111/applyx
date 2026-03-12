import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/data";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { hasDodoBillingConfig } from "@/lib/dodo/client";
import { getPlanById, planCatalog } from "@/lib/plans";
import { formatCurrencyAmount } from "@/lib/money";
import { toErrorResponse } from "@/lib/security/api";

/**
 * Returns all data needed for the dashboard overview page.
 * This endpoint exists so the overview page can render instantly
 * as a client component and fetch data asynchronously.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const snapshot = await getDashboardSnapshot(user);
    const plan = getPlanById(snapshot.currentUser.plan);
    const developerAdmin = isDeveloperAdminUser(snapshot.currentUser);
    const hasDodo = hasDodoBillingConfig();

    const upgradePlans = planCatalog
      .filter((entry) => {
        if (entry.id === "free") return false;
        if (snapshot.currentUser.plan === "free") return true;
        if (snapshot.currentUser.plan === "basic") return entry.id === "premium";
        return false;
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        monthlyTailors: p.monthlyTailors,
        monthlyTrackerParses: p.monthlyTrackerParses,
        formattedPrice: formatCurrencyAmount(p.price, p.currency),
      }));

    return NextResponse.json({
      currentUser: {
        plan: snapshot.currentUser.plan,
      },
      trackerStats: snapshot.trackerStats,
      resumes: snapshot.resumes.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        isPrimary: r.isPrimary,
      })),
      tailoredResumes: snapshot.tailoredResumes.slice(0, 3).map((t) => ({
        id: t.id,
        jobTitle: t.jobTitle,
        companyName: t.companyName,
        templateUsed: t.templateUsed,
        matchScoreAfter: t.matchScoreAfter,
        createdAt: t.createdAt,
      })),
      remainingTailors: snapshot.remainingTailors,
      plan: plan
        ? {
            name: plan.name,
            masterResumeLimit: plan.masterResumeLimit,
          }
        : null,
      developerAdmin,
      hasDodo,
      upgradePlans,
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Failed to load dashboard data.",
      logLabel: "api/dashboard",
    });
  }
}

