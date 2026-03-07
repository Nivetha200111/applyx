import { pricingTiers } from "@/lib/demo-data";
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
          Razorpay subscriptions and plan enforcement land here in Step 8. The shell is
          already structured around free, basic, and pro billing states.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            Basic plan • Billing cycle started February 28, 2026 • 12 of 30 tailors used
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">
          Billing settings, invoice history, and Razorpay customer metadata will be wired
          once the payment flow is implemented.
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
