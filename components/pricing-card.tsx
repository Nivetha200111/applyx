"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full"
      initial={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.985 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={reduceMotion ? undefined : { y: -10, scale: 1.015 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
    >
      <Card
        className={cn(
          "flex h-full flex-col",
          tier.highlighted && "border-primary/50 bg-card shadow-glow",
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
          <div className="rounded-[22px] border border-border/70 bg-background/80 p-4">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Included usage
            </div>
            <div className="mt-2 text-sm font-medium text-foreground">{tier.usage}</div>
            <div className="mt-1 text-sm text-muted-foreground">{tier.modelAccess}</div>
          </div>
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
    </motion.div>
  );
}
