import { pricingTiers } from "@/lib/plans";
import { PricingCard } from "@/components/pricing-card";

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-semibold sm:text-5xl">Simple pricing for active job searches</h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Start with 2 free demos, move to a low-cost model tier when volume matters,
          and upgrade to premium models only when you want stronger rewrite quality.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.name} tier={tier} />
        ))}
      </div>
    </div>
  );
}
