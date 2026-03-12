import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
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
    q: "What can I do on the free tier?",
    a: "Track up to 10 applications, use 5 AI auto-fills from JDs, and get 2 free resume tailors. Status, follow-ups, and tailoring stay manual.",
  },
  {
    q: "What does automation mean on paid plans?",
    a: "Basic auto-sets your status to applying and schedules a 7-day follow-up when you parse a JD. Premium goes further — it also auto-tailors your primary resume and links it to the application, all in one paste.",
  },
  {
    q: "How does AI tailoring differ between plans?",
    a: "Basic optimizes for speed and volume — great for application sprints. Premium uses a deeper rewrite pass tuned for competitive roles where nuance and bullet ordering matter most.",
  },
  {
    q: "Are taxes included in the listed price?",
    a: "Yes. The displayed launch pricing is tax-inclusive where applicable during beta.",
  },
  {
    q: "Can I add applications without AI?",
    a: "Yes. Quick add lets you manually enter company and role — no AI credit used. AI auto-fill is only consumed when you paste a JD.",
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
          text="Simple pricing for serious job searches."
        />
        <AnimatedPanel delay={0.4} hover={false}>
          <p className="text-lg leading-8 text-muted-foreground">
            Start with 2 free demos. Basic automates status tracking and follow-ups.
            Premium auto-tailors your resume the moment you paste a JD.
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

      {/* Tailoring comparison */}
      <section className="space-y-8">
        <AnimatedPanel hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Tailoring quality by plan</h2>
          </div>
        </AnimatedPanel>

        <div className="grid gap-6 md:grid-cols-2">
          <AnimatedPanel delay={0.08}>
            <Card className="h-full shimmer">
              <CardHeader>
                <Badge className="w-fit">Basic tier</Badge>
                <CardTitle>Fast &amp; efficient</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>Optimized for speed — tailored resumes generated in seconds</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>Best for high-volume application sprints where turnaround matters most</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>Smart fallback ensures every tailor completes reliably</span>
                </div>
              </CardContent>
            </Card>
          </AnimatedPanel>

          <AnimatedPanel delay={0.18}>
            <Card className="h-full border-primary/40 shimmer">
              <CardHeader>
                <Badge variant="success" className="w-fit">Premium tier</Badge>
                <CardTitle className="text-gradient">Deep &amp; precise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <div className="flex gap-3">
                  <Zap className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>Deeper rewrite pass tuned for dense, nuanced job descriptions</span>
                </div>
                <div className="flex gap-3">
                  <Zap className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>Stronger bullet ordering, cleaner emphasis, and smarter fit decisions</span>
                </div>
                <div className="flex gap-3">
                  <Zap className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>Built for competitive roles where rewrite quality matters more than raw throughput</span>
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
