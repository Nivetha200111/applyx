import Link from "next/link";
import { Check } from "lucide-react";
import type { PricingTier } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  tier: PricingTier;
}

export function PricingCard({ tier }: PricingCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col",
        tier.highlighted && "border-primary/50 bg-white shadow-glow",
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{tier.name}</CardTitle>
          {tier.highlighted ? <Badge variant="success">Most Popular</Badge> : null}
        </div>
        <CardDescription>{tier.description}</CardDescription>
        <div className="flex items-end gap-1 pt-4">
          <span className="text-4xl font-semibold">{tier.price}</span>
          <span className="pb-1 text-sm text-muted-foreground">{tier.cadence}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {tier.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 text-primary" />
            <span>{feature}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Link
          className={cn(
            buttonVariants({ variant: tier.highlighted ? "default" : "outline" }),
            "w-full",
          )}
          href={tier.href}
        >
          {tier.ctaLabel}
        </Link>
      </CardFooter>
    </Card>
  );
}
