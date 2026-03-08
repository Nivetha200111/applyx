import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PricingCard } from "@/components/pricing-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getPaymentsForUser, refreshUserAccess } from "@/lib/data";
import { hasDodoBillingConfig } from "@/lib/dodo/client";
import { planCatalog, pricingTiers } from "@/lib/plans";

export default async function SettingsPage() {
  const sessionUser = await requireUser("/settings");
  const user = await refreshUserAccess(sessionUser);
  const payments = await getPaymentsForUser(user.id, 6);
  const hasDodo = hasDodoBillingConfig();
  const developerAdmin = isDeveloperAdminUser(user);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Account and billing</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          {developerAdmin
            ? "Developer access is active on this account. Premium features are unlocked and billing is bypassed."
            : hasDodo
              ? "Upgrade between Free, Basic, and Premium using secure hosted checkout."
              : "Billing is not configured yet for this deployment."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-3">
            {developerAdmin
              ? "Developer admin access • Premium features unlocked without billing"
              : `${user.plan[0].toUpperCase()}${user.plan.slice(1)} plan • ${
                  user.billingCycleEnd
                    ? `Renews / expires ${new Date(user.billingCycleEnd).toLocaleDateString("en-IN")}`
                    : "No active paid cycle"
                }`}
            {!developerAdmin && user.billingProvider === "dodo" && user.billingCustomerId ? (
              <BillingPortalButton />
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          {user.plan === "premium"
            ? "Premium routes to Grok 4 Fast first and falls back to Grok 3 Mini."
            : user.plan === "basic"
              ? "Basic routes to Grok 3 Mini first and falls back to Grok 4 Fast."
              : "Free gives you 2 live demos using Grok 3 Mini / Grok 4 Fast before you need to upgrade."}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.name} tier={tier} />
        ))}
      </div>

      {developerAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Developer override</CardTitle>
            <CardDescription>
              Checkout and subscription management are disabled for this account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            Your login is allowlisted as a developer admin, so the app grants premium
            access automatically and bypasses payment collection.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {planCatalog
            .filter((plan) => plan.id !== "free")
            .map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name} payment</CardTitle>
                  <CardDescription>
                    {hasDodo ? "Secure Dodo checkout" : "Billing setup required"}{" "}
                    for{" "}
                    {plan.monthlyTailors > 9999 ? "unlimited" : plan.monthlyTailors} monthly tailors
                    at ₹{plan.priceInr}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CheckoutButton
                    disabled={!hasDodo}
                    label={
                      hasDodo
                        ? user.plan === plan.id
                          ? `Renew ${plan.name}`
                          : `Upgrade to ${plan.name}`
                        : "Billing unavailable"
                    }
                    planId={plan.id as "basic" | "premium"}
                  />
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent payments</CardTitle>
          <CardDescription>
            Recent billing activity appears here after checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-sm leading-7 text-muted-foreground">
              No payment records yet.
            </p>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-[24px] border border-border/70 bg-card/80 p-4"
              >
                <div className="font-semibold">
                  {payment.planTier[0].toUpperCase()}
                  {payment.planTier.slice(1)} • ₹{payment.amountInr}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {payment.status} • {new Date(payment.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
