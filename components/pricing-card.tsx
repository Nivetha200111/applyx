"use client";

import Link from "next/link";
import { Check, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { PricingTier } from "@/lib/types";
import { SpotlightCard } from "@/components/ui/spotlight";
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
  const isPremium = tier.name === "Premium";

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <SpotlightCard className="h-full">
        <Card
          className={cn(
            "flex h-full flex-col shimmer",
            tier.highlighted && "border-primary/50 bg-card shadow-glow-lg",
            isPremium && "border-accent/40",
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isPremium ? (
                  <Crown className="h-5 w-5 text-accent" />
                ) : tier.highlighted ? (
                  <Sparkles className="h-5 w-5 text-primary" />
                ) : null}
                <CardTitle>{tier.name}</CardTitle>
              </div>
              {tier.highlighted ? <Badge variant="success">Most Popular</Badge> : null}
              {isPremium ? (
                <Badge
                  className="border-amber-200/30 bg-amber-300 text-slate-950 shadow-sm shadow-amber-500/10"
                  variant="warning"
                >
                  Best Quality
                </Badge>
              ) : null}
            </div>
            <CardDescription>{tier.description}</CardDescription>
            <div className="flex items-end gap-1 pt-4">
              <span className={cn(
                "text-4xl font-semibold",
                isPremium && "text-gradient",
              )}>
                {tier.price}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">{tier.cadence}</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <div className={cn(
              "rounded-[22px] border border-border/70 bg-background/80 p-4",
              isPremium && "border-accent/20 bg-accent/5",
              tier.highlighted && "border-primary/20 bg-primary/5",
            )}>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Included usage
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">{tier.usage}</div>
              <div className="mt-1 text-sm text-muted-foreground">{tier.modelAccess}</div>
            </div>
            {tier.features.map((feature, i) => (
              <motion.div
                key={feature}
                className="flex items-start gap-3 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.06, ease: "easeOut" }}
              >
                <Check className={cn(
                  "mt-0.5 h-4 w-4",
                  isPremium ? "text-accent" : "text-primary",
                )} />
                <span>{feature}</span>
              </motion.div>
            ))}
          </CardContent>
          <CardFooter>
            <Link
              className={cn(
                buttonVariants({ variant: tier.highlighted || isPremium ? "default" : "outline" }),
                "w-full shimmer",
                tier.highlighted && !isPremium &&
                  "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 dark:text-white",
                isPremium &&
                  "bg-gradient-to-r from-emerald-400 via-primary to-accent text-slate-950 shadow-lg shadow-primary/20 hover:opacity-95 dark:text-slate-950",
              )}
              href={tier.href}
            >
              {tier.ctaLabel}
            </Link>
          </CardFooter>
        </Card>
      </SpotlightCard>
    </motion.div>
  );
}
