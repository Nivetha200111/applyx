import type { AppUser } from "@/lib/types";

const DEVELOPER_BILLING_PROVIDER = "developer";
const DEVELOPER_MONTHLY_TAILOR_LIMIT = 100000;

function getDeveloperAdminEmails() {
  return (process.env.DEVELOPER_ADMIN_EMAILS ?? "")
    .split(/[,\n]/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isDeveloperAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getDeveloperAdminEmails().includes(email.trim().toLowerCase());
}

export function isDeveloperAdminUser(user: Pick<AppUser, "billingProvider"> | null | undefined) {
  return user?.billingProvider === DEVELOPER_BILLING_PROVIDER;
}

export function applyDeveloperAdminAccess(user: AppUser): AppUser {
  if (!isDeveloperAdminEmail(user.email)) {
    return user;
  }

  return {
    ...user,
    plan: "premium",
    billingProvider: DEVELOPER_BILLING_PROVIDER,
    billingCycleEnd: null,
    monthlyTailorLimit: DEVELOPER_MONTHLY_TAILOR_LIMIT,
    preferredModelTier: "premium",
    billingCustomerId: null,
    billingSubscriptionId: null,
  };
}

