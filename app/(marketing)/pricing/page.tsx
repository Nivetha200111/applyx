import { ArrowRight, CheckCircle2, Cpu, Zap } from "lucide-react";
import Link from "next/link";
import { pricingTiers } from "@/lib/plans";
import { PricingCard } from "@/components/pricing-card";
import { AnimatedPanel } from "@/components/ui/animated-panel";
import { AnimatedText } from "@/components/ui/animated-text";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What happens after my 2 free demos?",
    a: "You can upgrade to Basic (₹199/mo) for 40 monthly tailors with GPT-4o mini, or Premium (₹699/mo) for 50 premium tailors with Claude Sonnet 4.",
  },
  {
    q: "Which AI models do I get?",
    a: "Free and Basic use affordable models (GPT-4o mini, Claude Haiku 4.5) for fast, cost-effective tailoring. Premium unlocks Claude Sonnet 4 and GPT-4o for the most nuanced rewrites.",
  },
  {
    q: "Is GST included in the listed price?",
    a: "Yes. The displayed launch pricing is GST-inclusive. Current India UPI checkout also avoids payment-gateway MDR, which helps keep the plans lower.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Paid plans can run through hosted checkout when configured, and the fallback manual billing flow can be stopped at the next cycle without automatic renewal.",
  },
  {
    q: "Why is pricing in rupees?",
    a: "ApplyX is built for Indian job seekers. We price in INR so you never pay inflated dollar-denominated SaaS rates for a local job search workflow.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Header */}
      <section className="relative max-w-2xl space-y-5">
        <FloatingParticles />
        <AnimatedPanel hover={false}>
          <Badge variant="warning" className="w-fit">Pricing</Badge>
        </AnimatedPanel>
        <AnimatedText
          as="h1"
          className="text-4xl font-semibold sm:text-5xl"
          delay={0.08}
          text="Simple pricing for active job searches."
        />
        <AnimatedPanel delay={0.4} hover={false}>
          <p className="text-lg leading-8 text-muted-foreground">
            Start with 2 free demos, move to affordable AI when volume matters,
            and upgrade to premium models only when you want the strongest rewrites.
          </p>
        </AnimatedPanel>
      </section>

      {/* Pricing cards */}
      <section className="grid gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier, i) => (
          <AnimatedPanel key={tier.name} delay={0.1 + 0.1 * i}>
            <PricingCard tier={tier} />
          </AnimatedPanel>
        ))}
      </section>

      {/* Model comparison */}
      <section className="space-y-8">
        <AnimatedPanel hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">AI models by plan</h2>
          </div>
        </AnimatedPanel>

        <div className="grid gap-6 md:grid-cols-2">
          <AnimatedPanel delay={0.08}>
            <Card className="h-full shimmer">
              <CardHeader>
                <Badge className="w-fit">Basic tier</Badge>
                <CardTitle>GPT-4o mini + Claude Haiku 4.5</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>Fast inference under 10 seconds per tailor</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>Strong keyword extraction and bullet rewriting</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>Ideal for high-volume application sprints</span>
                </div>
              </CardContent>
            </Card>
          </AnimatedPanel>

          <AnimatedPanel delay={0.18}>
            <Card className="h-full border-primary/40 shimmer">
              <CardHeader>
                <Badge variant="success" className="w-fit">Premium tier</Badge>
                <CardTitle className="text-gradient">Claude Sonnet 4 + GPT-4o</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <div className="flex gap-3">
                  <Zap className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>Deeper reasoning for nuanced bullet rewrites</span>
                </div>
                <div className="flex gap-3">
                  <Zap className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>Better context-aware skill matching and ordering</span>
                </div>
                <div className="flex gap-3">
                  <Zap className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>Higher match score uplift on complex JDs</span>
                </div>
              </CardContent>
            </Card>
          </AnimatedPanel>
        </div>
      </section>

      {/* FAQs */}
      <section className="space-y-8">
        <AnimatedText
          as="h2"
          className="text-2xl font-semibold sm:text-3xl"
          delay={0.05}
          text="Frequently asked questions"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq, i) => (
            <AnimatedPanel key={faq.q} delay={0.06 + 0.08 * i}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  {faq.a}
                </CardContent>
              </Card>
            </AnimatedPanel>
          ))}
        </div>
      </section>

      {/* CTA */}
      <AnimatedPanel>
        <div className="relative overflow-hidden rounded-[32px] bg-slate-950 px-8 py-14 text-center text-slate-50 sm:px-16">
          <div
            aria-hidden
            className="glow-orb left-1/4 top-0 h-40 w-40 bg-primary/20"
          />
          <div
            aria-hidden
            className="glow-orb bottom-0 right-1/4 h-40 w-40 bg-accent/15"
            style={{ animationDelay: "4s" }}
          />
          <div className="relative space-y-5">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Start with 2 free demos. No card needed.
            </h2>
            <Link
              className={cn(buttonVariants({ size: "lg" }), "gap-2 shimmer")}
              href="/signup"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </AnimatedPanel>
    </div>
  );
}
