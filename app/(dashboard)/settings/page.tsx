import { pricingTiers } from "@/lib/plans";
import { PricingCard } from "@/components/pricing-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Account and billing</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Razorpay subscriptions and plan enforcement still need to be wired, but the
          plan structure now separates free demos, Basic budget-model usage, and Premium
          high-model usage.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            Premium plan • Billing cycle started March 1, 2026 • 18 of 80 premium
            tailors used
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          Premium routes to Claude Sonnet 4 first and falls back to GPT-4.1 when needed.
          Basic stays on the lower-cost GPT-4.1 mini and Claude 3.5 Haiku pool to keep
          pricing India-friendly.
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.name} tier={tier} />
        ))}
      </div>
    </div>
  );
}
