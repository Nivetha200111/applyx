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
import { getPaymentsForUser, refreshUserAccess } from "@/lib/data";
import { planCatalog, pricingTiers } from "@/lib/plans";

export default async function SettingsPage() {
  const sessionUser = await requireUser("/settings");
  const user = await refreshUserAccess(sessionUser);
  const payments = await getPaymentsForUser(user.id, 6);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Account and billing</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Upgrade between Free, Basic, and Premium, and track successful Razorpay
          payments here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            {user.plan[0].toUpperCase()}
            {user.plan.slice(1)} plan •{" "}
            {user.billingCycleEnd
              ? `Renews / expires ${new Date(user.billingCycleEnd).toLocaleDateString("en-IN")}`
              : "No active paid cycle"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          {user.plan === "premium"
            ? "Premium routes to Claude Sonnet 4 first and falls back to GPT-4.1."
            : user.plan === "basic"
              ? "Basic routes to GPT-4.1 mini first and falls back to Claude 3.5 Haiku."
              : "Free gives you 2 live demos before you need to upgrade."}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.name} tier={tier} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {planCatalog
          .filter((plan) => plan.id !== "free")
          .map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name} checkout</CardTitle>
                <CardDescription>
                  Activate {plan.monthlyTailors} monthly tailors for ₹{plan.priceInr}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CheckoutButton
                  label={
                    user.plan === plan.id ? `Renew ${plan.name}` : `Upgrade to ${plan.name}`
                  }
                  planId={plan.id as "basic" | "premium"}
                />
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent payments</CardTitle>
          <CardDescription>
            Successful and pending orders from Razorpay appear here.
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
                  {payment.status} • {new Date(payment.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
